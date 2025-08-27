import { AgreementType, ProfileType, UpdateAgreementType, WithdrawType } from '@/myleisure/auth/types/credential.type';
import bcrypt from 'bcryptjs';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/myleisure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';
import { UserToken } from '@/myleisure/entities/user/userToken.entity';
import { UserAgreement } from '@/myleisure/entities/user/userAgreement.entity';
import { UserDeleted } from '@/myleisure/entities/user/userDeleted.entity';
import { JwtService } from '@nestjs/jwt';
import AppConfig from '@/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserAuth) private readonly userAuthRepo: Repository<UserAuth>,
    @InjectRepository(UserToken) private readonly userTokenRepo: Repository<UserToken>,
    @InjectRepository(UserAgreement) private readonly userAgreementRepo: Repository<UserAgreement>,
    @InjectRepository(UserDeleted) private readonly userDeletedRepo: Repository<UserDeleted>,
    private readonly jwtService: JwtService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  async getUserByEmail(mail_address: string) {
    return this.userRepo.findOne({ where: { mail_address }, relations: ['user_auth', 'user_agreement'] });
  }

  async getUserById(userId: string) {
    return this.userRepo.findOneBy({ user_id: userId });
  }

  async getUserToken(userId: string) {
    return this.userTokenRepo.findOneBy({ user_id: userId });
  }
  async getDeletedUser(mail_address: string) {
    return this.userDeletedRepo.findOne({ where: { mail_address } });
  }

  async insertUser(payload: { mail_address: string; password: string; agreements: AgreementType }) {
    const newUserAuth = this.userAuthRepo.create({ mail_address: payload.mail_address });
    newUserAuth.password = await bcrypt.hash(payload.password, 10);
    const newUser = this.userRepo.create({ mail_address: payload.mail_address });
    let newUserAgreement = this.userAgreementRepo.create();
    newUserAgreement = { ...newUserAgreement, ...payload.agreements };
    newUserAuth.user = newUser;
    newUserAuth.user_agreement = newUserAgreement;
    return await this.userAuthRepo.save(newUser);
  }

  async comparePassword(payloadPassword: string, hashedPassword: string) {
    return await bcrypt.compare(payloadPassword, hashedPassword);
  }

  async generateRefreshToken(userId: string) {
    let userToken = await this.userTokenRepo.findOneBy({ user_id: userId });
    if (userToken.token_version) userToken.token_version += 1;
    else userToken = this.userTokenRepo.create({ user_id: userId, token_version: 1 });
    userToken.refresh_token = await this.jwtService.signAsync(
      { user_id: userId, token_version: userToken.token_version },
      {
        secret: this.config.jwt.refreshSecret,
        expiresIn: this.config.jwt.refreshExpire,
      },
    );

    userToken.expires_at = this.jwtService.decode(userToken.refresh_token).exp;

    return this.userTokenRepo.save(userToken);
  }

  async generateAccessToken(userId: string) {
    const accessToken = await this.jwtService.signAsync(
      { user_id: userId },
      {
        secret: this.config.jwt.accessSecret,
        expiresIn: this.config.jwt.accessExpire,
      },
    );
    const decoded = this.jwtService.decode(accessToken);
    return {
      accessToken,
      expiresAt: decoded.exp,
    };
  }
  async validateRefresh(token: string) {
    try {
      const payload = await this.validateToken(token, 'refresh');
      const user = await this.getUserById(payload.userId);
      if (
        user.user_auth.user_token.refresh_token !== token ||
        user.user_auth.user_token.token_version !== payload.version
      )
        throw new UnauthorizedException();
      return user;
    } catch (e) {
      if (token) throw new UnauthorizedException('만료된 토큰입니다.');
      else throw new UnauthorizedException();
    }
  }

  async validateToken(token: string, type: 'access' | 'refresh' | 'resetPassword') {
    return await this.jwtService.verifyAsync(token, {
      secret: this.config.jwt[`${type}Secret`],
    });
  }

  async makePasswordResetChange(userId: string, passwordToken: string | null, state: boolean) {
    const userToken = await this.userTokenRepo.findOne({ where: { user_id: userId } });
    userToken.password_token = passwordToken;
    userToken.is_password_reset = state;
    await this.userTokenRepo.save(userToken);
    return true;
  }

  async updatePassword(userId: string, password: string) {
    const userAuth = await this.userAuthRepo.findOne({ where: { user_id: userId } });
    userAuth.password = password;
    await this.userRepo.save(userAuth);
    return true;
  }

  async generatePasswordToken(userId: string) {
    const userToken = await this.userTokenRepo.findOne({ where: { user_id: userId } });
    const password_token = await this.jwtService.signAsync(
      { user_id: userId },
      {
        secret: this.config.jwt.resetPasswordSecret,
        expiresIn: this.config.jwt.resetPasswordExpire,
      },
    );
    userToken.password_token = password_token;
    return password_token;
  }

  async validatePasswordToken(userId: string, password_token: string) {
    try {
      const payload = await this.validateToken(`Bearer ${password_token}`, 'resetPassword');
      const user = await this.userTokenRepo.findOneBy({ user_id: payload.user_id });
      if (user?.password_token !== password_token)
        throw new UnauthorizedException('auth.service.validatePasswordToken:// 잘못된 요청입니다.');
      return payload;
    } catch (e: unknown) {
      throw new UnauthorizedException('auth.service.validatePasswordToken');
    }
  }

  async updateProfileById(payload: ProfileType) {
    try {
      const user = await this.getUserById(payload.user_id);
      const newUser = { ...user, ...payload };
      return await this.userRepo.save(newUser);
    } catch (e) {
      throw new BadRequestException('auth.service.updateProfileById');
    }
  }

  async withdrawById(payload: WithdrawType) {
    try {
      const userAuth = await this.userAuthRepo.findOne({ where: { user_id: payload.user_id } });
      userAuth.withdraw_survey = payload.withdrawSurvey;
      return await this.userAuthRepo.save(userAuth);
    } catch (e) {
      throw new BadRequestException('auth.service.withdrawById');
    }
  }

  async putAgreement(payload: UpdateAgreementType) {
    try {
      const userAgreement = await this.userAgreementRepo.findOne({ where: { user_id: payload.user_id } });
      const newUserAgreement = { ...userAgreement, ...payload };
      return await this.userAgreementRepo.save(newUserAgreement);
    } catch (e) {
      throw new BadRequestException('auth.service.putAgreement');
    }
  }
}
