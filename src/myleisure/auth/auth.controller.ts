import { BadRequestException, Body, Controller, Delete, HttpCode, Inject, Post, Put, Req, Res } from '@nestjs/common';
import { AuthService } from '@/myleisure/auth/auth.service';
import {
  CredentialType,
  ProfileType,
  SignUpType,
  UpdateAgreementType,
  WithdrawType,
} from '@/myleisure/auth/types/credential.type';
import { Request, Response } from 'express';
import { Public } from '@/decorators/public.decorator';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';
import { parseDuration } from '@/utils/parseDuration';
import AppConfig from '@/app.config';
import { ConfigType } from '@nestjs/config';

@Controller('/myleisure/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  @Public()
  @Post('new')
  async postAuthNew(@Body() payload: SignUpType, @Res() res: Response) {
    const signUpResult = await this.authService.signUpUser(payload);
    if (!(signUpResult instanceof UserAuth) && signUpResult?.remainDay !== undefined)
      return { remainDay: signUpResult.remainDay };
    await this.authService.signInUser(payload as CredentialType);
    const result = await this.authService.signInUser(payload as CredentialType);
    res.cookie('refreshToken', result.refreshToken, {
      domain: 'myleisure.kwondns.com',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseDuration(this.config.jwt.refreshExpire),
    });
    res.send(result.data);
  }

  @Public()
  @Post('')
  async postAuth(@Body() payload: CredentialType, @Res() res: Response) {
    const result = await this.authService.signInUser(payload);
    res.cookie('refreshToken', result.refreshToken, {
      domain: 'myleisure.kwondns.com',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseDuration(this.config.jwt.refreshExpire),
    });
    res.send(result.data);
  }

  @Public()
  @Post('refresh')
  async postAuthRefresh(@Req() req: Request, @Body() payload: { userId: string }, @Res() res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    const result = await this.authService.refreshUser({ user_id: payload.userId, refreshToken: refreshToken });
    res.cookie('refreshToken', result.refreshToken, {
      domain: 'myleisure.kwondns.com',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseDuration(this.config.jwt.refreshExpire),
    });
    res.send(result.data);
  }

  @Public()
  @Post('validate-mail')
  async postAuthValidateMail(@Body() payload: { mail_address: string }) {
    const result = await this.authService.validateMail(payload.mail_address);
    await this.authService.sendEmailResetPasswordLink(result.userId, payload.mail_address);
    return result;
  }

  @Public()
  @Post('reset-password')
  async postAuthResetPassword(@Body() payload: { token: string; userId: string }) {
    if (!payload.token) throw new BadRequestException(404, 'auth:// 잘못된 요청입니다.');
    await this.authService.accessResetPasswordLink(payload.userId, payload.token);
    return { isValidate: true };
  }

  @Post('signout')
  async postAuthLogOut(@Body() payload: { userId: string }, @Res() res: Response) {
    await this.authService.logout(payload.userId);
    res.cookie('refreshToken', '', {
      domain: 'myleisure.kwondns.com',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 0,
    });
    res.status(204).send();
  }

  @Public()
  @HttpCode(204)
  @Put('reset-password')
  async putAuthResetPassword(@Body() payload: { userId: string; password: string }) {
    const { userId: user_id, password } = payload;
    await this.authService.resetPassword({ user_id, password });
  }

  @HttpCode(204)
  @Put('profile')
  async putAuthProfile(@Body() payload: Omit<ProfileType, 'user_id'> & { userId: string }) {
    const { userId: user_id, ...others } = payload;
    await this.authService.updateProfile({ user_id, ...others });
  }

  @HttpCode(204)
  @Put('agreement')
  async putAgreement(@Body() payload: Omit<UpdateAgreementType, 'user_id'> & { userId: string }) {
    const { userId: user_id, ...others } = payload;
    return await this.authService.updateAgreement({ user_id, ...others });
  }

  @HttpCode(204)
  @Delete('withdraw')
  async deleteAuthWithdraw(@Body() payload: Omit<WithdrawType, 'user_id'> & { userId: string }) {
    const { userId: user_id, ...others } = payload;
    return await this.authService.withdraw({ user_id, ...others });
  }
}
