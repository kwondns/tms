import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import {
  CredentialType,
  ProfileType,
  RefreshType,
  ResetPasswordType,
  SignUpType,
  UpdateAgreementType,
  WithdrawType,
} from '@/myleisure/auth/types/credential.type';
import { AuthRepository } from '@/myleisure/auth/auth.repository';
import { MailService } from '@/myleisure/mail/mail.service';
import AppConfig from '@/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  async signUpUser(credentials: SignUpType) {
    const { mail_address, password, agreements } = credentials;
    const isExistMail = await this.authRepository.getUserByEmail(mail_address);
    const isDeleted = await this.authRepository.getDeletedUser(mail_address);
    if (isExistMail !== null) throw new ConflictException('auth.controller.signUpUser:// 이미 사용중인 이메일입니다.');
    if (isDeleted) {
      return { remainDay: this.getRemainingDays(isDeleted.completely_deleted_at) };
    }
    if (!agreements.myLeisureAgreed || !agreements.personalInfoAgreed)
      throw new BadRequestException('auth.controller.signUpUser:// 필수 약관에 동의가 필요합니다.');
    try {
      await this.authRepository.insertUser({ mail_address, password, agreements });
    } catch (e) {
      throw new BadRequestException('auth.controller.signUpUser');
    }
  }

  async signInUser(credentials: CredentialType) {
    const { mail_address, password } = credentials;
    try {
      const userInfo = await this.authRepository.getUserByEmail(mail_address);
      if (!userInfo || !(await this.authRepository.comparePassword(password, userInfo.user_auth.password)))
        throw new BadRequestException('auth.controller.signInUser:// 이메일 혹은 패스워드가 일치하지 않습니다.');
      const { user_id, ...info } = userInfo;
      const refreshToken = await this.authRepository.generateRefreshToken(userInfo.user_id);
      const accessToken = await this.authRepository.generateAccessToken(userInfo.user_id);
      return {
        data: { userId: user_id, ...info, email: mail_address, ...accessToken, social: 0 },
        refreshToken,
      };
    } catch (e) {
      throw new BadRequestException('auth.controller.signInUser');
    }
  }

  async refreshUser(credentials: RefreshType) {
    const { user_id, refreshToken } = credentials;
    try {
      await this.authRepository.validateRefresh(refreshToken);
      const newRefreshToken = await this.authRepository.generateRefreshToken(user_id);
      const newAccessToken = await this.authRepository.generateAccessToken(user_id);
      console.log('refreshUser', newRefreshToken, newAccessToken, user_id);
      return { refreshToken: newRefreshToken, data: { ...newAccessToken } };
    } catch (e) {
      throw new BadRequestException('auth.controller.refreshUser');
    }
  }

  async validateMail(mail_address: string) {
    try {
      const result = await this.authRepository.getUserByEmail(mail_address);
      if (result) return { userId: result.user_id, status: result.user_auth.status };
      else throw new BadRequestException('auth.controller.validateMail:// 회원정보를 찾을 수 없습니다.');
    } catch (e) {
      throw new BadRequestException('auth.controller.validateMail');
    }
  }

  async resetPassword(payload: ResetPasswordType) {
    const { user_id, password } = payload;
    try {
      const result = await this.authRepository.getUserById(user_id);
      if (result === null)
        throw new BadRequestException('auth.controller.resetPassword:// 회원정보를 찾을 수 없습니다.');
      const hashedPassword = await this.hashPassword(password);
      const updateResult = await this.authRepository.updatePassword(result.user_id, hashedPassword);
      await this.authRepository.makePasswordResetChange(user_id, null, false);
      return updateResult;
    } catch (e) {
      throw new BadRequestException('auth.controller.resetPassword');
    }
  }

  async accessResetPasswordLink(user_id: string, password_token: string) {
    try {
      const validateResult = await this.authRepository.validatePasswordToken(user_id, password_token);
      const user = await this.authRepository.getUserToken(validateResult);
      if (!user || !user.is_password_reset)
        throw new BadRequestException('auth.controller.accessResetPasswordLink:// 잘못된 요청입니다.');
      return validateResult;
    } catch (e) {
      throw new BadRequestException('auth.controller.accessResetPasswordLink');
    }
  }

  async updateProfile(payload: ProfileType) {
    try {
      return await this.authRepository.updateProfileById(payload);
    } catch (e) {
      throw new BadRequestException('auth.controller.updateProfile');
    }
  }

  async logout(payload: string) {
    try {
      return await this.authRepository.generateRefreshToken(payload);
    } catch (e) {
      throw new BadRequestException('auth.controller.updateProfile');
    }
  }

  async withdraw(payload: WithdrawType) {
    try {
      return await this.authRepository.withdrawById(payload);
    } catch (e) {
      throw new BadRequestException('auth.controller.withdraw');
    }
  }

  async updateAgreement(payload: UpdateAgreementType) {
    try {
      return await this.authRepository.putAgreement(payload);
    } catch (e) {
      throw new BadRequestException('auth.controller.updateAgreement');
    }
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  getRemainingDays(targetDate: string | Date): number {
    const today = new Date();
    const target = new Date(targetDate);
    const diffInMilliseconds = target.getTime() - today.getTime();
    return Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
  }
  async sendEmailResetPasswordLink(user_id: string, mail_address: string) {
    try {
      const password_token = await this.authRepository.generatePasswordToken(user_id);
      await this.authRepository.makePasswordResetChange(user_id, password_token, true);
      const user = await this.authRepository.getUserById(user_id);
      await this.mailService.resetPassword(mail_address, {
        name: user.name,
        link: this.config.myleisure.link,
      });
      return true;
    } catch (e) {
      throw new BadRequestException('auth.controller.sendEmailResetPasswordLink');
    }
  }
}
