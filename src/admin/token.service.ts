import { forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { AdminService } from './admin.service';
import AppConfig from '@/drive/app.config';

type PayloadType = {
  sub: string;
  username: string;
  exp?: number;
  iat?: number;
};

type RefreshPayloadType = PayloadType & {
  v: number;
};

@Injectable()
export class TokenService {
  constructor(
    @Inject(forwardRef(() => AdminService))
    private adminService: AdminService,
    private jwtService: JwtService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  async generateRefresh(payload: RefreshPayloadType) {
    try {
      const admin = await this.adminService.findOne(payload.sub);
      const { iat, exp, ...others } = payload;
      admin.refresh_token = await this.jwtService.signAsync(others, {
        secret: this.config.jwt.refreshSecret,
        expiresIn: this.config.jwt.refreshExpire,
      });
      admin.refresh_version += 1;

      return await this.adminService.update(admin);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async generateAccess(payload: PayloadType) {
    try {
      const { iat, exp, ...others } = payload;
      return await this.jwtService.signAsync(others, {
        secret: this.config.jwt.accessSecret,
        expiresIn: this.config.jwt.accessExpire,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validateRefresh(token: string) {
    try {
      const payload = await this.validateToken<RefreshPayloadType>(token, 'REFRESH');
      const admin = await this.adminService.findOne(payload.sub);
      if (payload.v !== admin.refresh_version || token !== admin.refresh_token) throw new Error();
      return payload;
    } catch (error) {
      if (token) throw new UnauthorizedException('Expired Token');
      else throw new UnauthorizedException();
    }
  }

  async validateAccess(token: string) {
    return await this.validateToken(token, 'ACCESS');
  }

  async validateToken<T extends PayloadType>(token: string, type: 'ACCESS' | 'REFRESH') {
    return await this.jwtService.verifyAsync<T>(token, {
      secret: this.config.jwt[`${type}Secret`],
    });
  }
}
