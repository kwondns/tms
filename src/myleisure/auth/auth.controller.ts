import { BadRequestException, Body, Controller, Delete, Post, Put, Req } from '@nestjs/common';
import { AuthService } from '@/myleisure/auth/auth.service';
import {
  CredentialType,
  ProfileType,
  SignUpType,
  UpdateAgreementType,
  WithdrawType,
} from '@/myleisure/auth/types/credential.type';
import { Request } from 'express';
import { Public } from '@/decorators/public.decorator';

@Controller('/myleisure/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('new')
  async postAuthNew(@Body() payload: SignUpType) {
    const signUpResult = await this.authService.signUpUser(payload);
    if (signUpResult?.remainDay !== undefined) return { status: 200, data: { remainDay: signUpResult.remainDay } };
    const result = await this.authService.signInUser(payload as CredentialType);

    return {
      status: 200,
      data: result.data,
      header: {
        'Set-Cookie': `refreshToken=Bearer ${result.refreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=2592000`,
      },
    };
  }

  @Public()
  @Post('')
  async postAuth(@Body() payload: CredentialType) {
    const result = await this.authService.signInUser(payload);
    return {
      status: 200,
      data: result.data,
      header: {
        'Set-Cookie': `refreshToken=Bearer ${result.refreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=2592000`,
      },
    };
  }

  @Public()
  @Post('refresh')
  async postAuthRefresh(@Req() req: Request, @Body() payload: { userId: string }) {
    const refreshToken = req.cookies['refresh-token'];

    const result = await this.authService.refreshUser({ user_id: payload.userId, refreshToken: refreshToken });
    return {
      status: 200,
      data: result.data,
      header: {
        'Set-Cookie': `refreshToken=Bearer ${result.refreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=2592000`,
      },
    };
  }

  @Public()
  @Post('validate-mail')
  async postAuthValidateMail(@Body() payload: { mail_address: string }) {
    const result = await this.authService.validateMail(payload.mail_address);
    await this.authService.sendEmailResetPasswordLink(result.userId, payload.mail_address);
    return { status: 200, data: result };
  }

  @Public()
  @Post('reset-password')
  async postAuthResetPassword(@Body() payload: { token: string; userId: string }) {
    if (!payload.token) throw new BadRequestException(404, 'auth:// 잘못된 요청입니다.');
    await this.authService.accessResetPasswordLink(payload.userId, payload.token);
    return { status: 200, data: { isValidate: true } };
  }

  @Post('signout')
  async postAuthLogOut(payload: { userId: string }) {
    await this.authService.logout(payload.userId);
    return {
      status: 204,
      header: {
        'Set-Cookie': `refreshToken=deleted; HttpOnly; Secure; SameSite=None; Path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`,
      },
    };
  }

  @Public()
  @Put('reset-password')
  async putAuthResetPassword(@Body() payload: { userId: string; password: string }) {
    const { userId: user_id, password } = payload;
    await this.authService.resetPassword({ user_id, password });
    return { status: 204 };
  }

  @Put('profile')
  async putAuthProfile(@Body() payload: Omit<ProfileType, 'user_id'> & { userId: string }) {
    const { userId: user_id, ...others } = payload;
    await this.authService.updateProfile({ user_id, ...others });
    return { status: 204 };
  }

  @Put('agreement')
  async putAgreement(@Body() payload: Omit<UpdateAgreementType, 'user_id'> & { userId: string }) {
    const { userId: user_id, ...others } = payload;
    return { status: 204, data: await this.authService.updateAgreement({ user_id, ...others }) };
  }

  @Delete('withdraw')
  async deleteAuthWithdraw(@Body() payload: Omit<WithdrawType, 'user_id'> & { userId: string }) {
    const { userId: user_id, ...others } = payload;
    return { status: 204, data: await this.authService.withdraw({ user_id, ...others }) };
  }
}
