import { Body, Controller, Get, HttpCode, Param, Post, Req, Res } from '@nestjs/common';
import { AdminService } from '@/admin/admin.service';
import { RequestAdminDto } from '@/admin/dtos/requestAdmin.dto';
import { Request, Response } from 'express';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { ResponseAdminDto } from '@/admin/dtos/responseAdmin.dto';
import { Public } from '@/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { parseDuration } from '@/utils/parseDuration';

declare module 'express' {
  interface Request {
    admin?: string;
  }
}
@Serialize(ResponseAdminDto)
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
  ) {}
  @Public()
  @Post('/signup')
  signUp(@Body() body: RequestAdminDto) {
    return this.adminService.signUp(body.username, body.password);
  }

  @HttpCode(200)
  @Public()
  @Post('/signin')
  async signIn(@Body() body: RequestAdminDto, @Res() res: Response) {
    const admin = await this.adminService.signIn(body.username, body.password);
    res.cookie('refreshToken', admin.refresh_token, {
      httpOnly: true,
      maxAge: parseDuration(this.configService.get('TOKEN_REFRESH_EXPIRE')),
    });
    res.send({ username: admin.username, accessToken: admin.accessToken });
  }

  @Get('/whoami')
  async whoAmI(@Req() req: Request) {
    const { admin } = req;
    return await this.adminService.findOne(admin);
  }

  @HttpCode(200)
  @Public()
  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    const { newRefreshToken, newAccessToken } = await this.adminService.refresh(refreshToken);
    res.cookie('refreshToken', newRefreshToken.refresh_token, {
      httpOnly: true,
      maxAge: parseDuration(this.configService.get('TOKEN_REFRESH_EXPIRE')),
    });
    res.send({ accessToken: newAccessToken });
  }

  @HttpCode(204)
  @Public()
  @Get('/signout/:admin_id')
  async signOut(@Param('admin_id') adminId: string) {
    return await this.adminService.signOut(adminId);
  }
}
