import { User } from '@/drive/user/entities/user.entity';
import { parseDuration } from '@/utils/parseDuration';
import { SignOutDto } from '@/drive/user/dto/sign-out.dto';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import AppConfig from '@/drive/app.config';
import { ConfigType } from '@nestjs/config';
import { UserService } from '@/drive/user/services/user.service';
import { PasswordReset } from '@/drive/user/entities/password-reset.entity';
import { VerifyResetPasswordDto } from '@/drive/user/dto/update-user.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PasswordReset) private readonly passwordResetRepo: Repository<PasswordReset>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  /**
   * 새로운 RefreshToken 생성, 저장 및 반환
   * 새로운 토큰 생성 및 DB 상 데이터 수정
   * refresh_token_version -> +1
   * refresh_token_expires_at -> env 설정된 값
   * @param user
   */
  async generateRefreshToken(user: User) {
    const { user_id, name, email } = user;
    const now = new Date();
    const newVersion = user.token.refresh_token_version + 1;
    user.token.refresh_token_expires_at = new Date(now.getTime() + parseDuration(this.config.jwt.refreshExpire));
    user.token.refresh_token_version = newVersion;
    user.token.refresh_token = await this.jwtService.signAsync(
      { user_id, name, email, version: newVersion },
      {
        secret: this.config.jwt.refreshSecret,
        expiresIn: this.config.jwt.refreshExpire,
      },
    );
    return await this.userRepo.save(user);
  }

  /**
   * 새로운 AccessToken 생성 및 반환
   * @param user
   */
  async generateAccessToken(user: User) {
    const { user_id, name, email } = user;
    const now = new Date();

    return {
      user,
      accessToken: await this.jwtService.signAsync(
        { user_id, name, email },
        {
          secret: this.config.jwt.accessSecret,
          expiresIn: this.config.jwt.accessExpire,
        },
      ),
      accessTokenExpiresAt: new Date(now.getTime() + parseDuration(this.config.jwt.accessExpire)),
    };
  }

  /**
   * RefreshToken 제거
   * 로그아웃 시 DB에 저장된 토큰값 제거
   * @param signOutDto
   */
  async resetRefreshToken(signOutDto: SignOutDto) {
    const user = await this.userRepo.findOne({ where: { user_id: signOutDto.userId }, relations: ['token'] });
    user.token.refresh_token_expires_at = new Date();
    user.token.refresh_token = null;
    return await this.userRepo.save(user);
  }

  /**
   * 토큰 유효성 검증
   * type에 따라 Access, Refresh 토큰 검증
   * 검증에 실패시 에러 반환
   * 유효 토큰일 경우 페이로드 반환
   * @param token
   * @param type
   */
  async validateToken(token: string, type: 'access' | 'refresh' | 'resetPassword') {
    return await this.jwtService.verifyAsync(token, {
      secret: this.config.jwt[`${type}Secret`],
    });
  }

  /**
   * AccessToken 검증
   * @param token
   */
  async validateAccess(token: string) {
    return await this.validateToken(token, 'access');
  }

  /**
   * RefreshToken 검증
   * 토큰 유효성 검증 후 DB의 토큰 버전도 비교하여 2차 검증
   * @param token
   */
  async validateRefresh(token: string) {
    try {
      const payload = await this.validateToken(token, 'refresh');
      const user = await this.userService.findUserByUserId({ userId: payload.user_id });
      if (user.token.refresh_token !== token || user.token.refresh_token_version !== payload.version)
        throw new UnauthorizedException();
      return user;
    } catch (e) {
      if (token) throw new UnauthorizedException('만료된 토큰입니다.');
      else throw new UnauthorizedException();
    }
  }

  /**
   * Password 초기화 요청 제거
   * @param user
   */
  async deleteResetPasswordState(user: User) {
    await this.passwordResetRepo.delete(user.password_reset_token.id);
  }

  /**
   * Password 초기화 요청 상태 여부 확인
   * @param user
   */
  async isAlreadyExistResetPassword(user: User) {
    if (user.password_reset_token?.id) {
      await this.deleteResetPasswordState(user);
    }
    return user;
  }

  /**
   * 패스워드 초기화 토큰 발급
   * @param user
   */
  async setPasswordResetState(user: User) {
    const password_reset_token = await this.jwtService.signAsync(
      {
        email: user.email,
        user_id: user.user_id,
      },
      {
        secret: this.config.jwt.resetPasswordSecret,
        expiresIn: this.config.jwt.resetPasswordExpire,
      },
    );
    const now = new Date();
    const password_reset_token_expires_at = new Date(
      now.getTime() + parseDuration(this.config.jwt.resetPasswordExpire),
    );

    user.password_reset_token = this.passwordResetRepo.create({
      password_reset_token,
      password_reset_token_expires_at,
    });
    await this.userRepo.save(user);

    return {
      name: user.name,
      link: `${this.config.frontURL}/reset-password?reset-password-token=${password_reset_token}&user_id=${user.user_id}`,
    };
  }

  /**
   * PasswordResetToken 검증
   * 만료기간, 일치여부 확인
   * @param verifyPasswordDto
   */
  async verifyResetToken(verifyPasswordDto: VerifyResetPasswordDto) {
    await this.validateToken(verifyPasswordDto.passwordResetToken, 'resetPassword');
    const { password_reset_token } = await this.userService.findUserByUserId(verifyPasswordDto);
    if (password_reset_token.password_reset_token !== verifyPasswordDto.passwordResetToken)
      throw new BadRequestException('잘못된 요청입니다.');
  }
}
