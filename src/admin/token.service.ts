import { forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';

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
    private configService: ConfigService,
  ) {}

  async generateRefresh(payload: RefreshPayloadType) {
    try {
      const admin = await this.adminService.findOne(payload.sub);
      const { iat, exp, ...others } = payload;
      admin.refresh_token = await this.jwtService.signAsync(others, {
        secret: this.configService.get('TOKEN_REFRESH_SECRET'),
        expiresIn: this.configService.get('TOKEN_REFRESH_EXPIRE'),
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
        secret: this.configService.get('TOKEN_ACCESS_SECRET'),
        expiresIn: this.configService.get('TOKEN_ACCESS_EXPIRE'),
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
      throw new UnauthorizedException('Expired Token');
    }
  }

  async validateAccess(token: string) {
    return await this.validateToken(token, 'ACCESS');
  }

  async validateToken<T extends PayloadType>(token: string, type: 'ACCESS' | 'REFRESH') {
    return await this.jwtService.verifyAsync<T>(token, {
      secret: this.configService.get(`TOKEN_${type}_SECRET`),
    });
  }
}
