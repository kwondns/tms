import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { TokenService } from '@/time/user/services/token.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    if (request.route.path === '/metrics') return true;
    const token = this.extractToken(request);

    if (!(request.route.path as string).startsWith('/myleisure') && !token) {
      this.logger.warn('Authentication failed - No token provided', {
        context: 'AuthGuard',
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
      });
      throw new UnauthorizedException();
    }
    try {
      const result = await this.tokenService.validateAccess(token);
      // ! TODO 관리자 계정 생성하여 관리
      if (
        (request.route.path !== '/drive/notice' && (request.route.path as string).startsWith('/drive')) ||
        (request.route.path as string).startsWith('/time') ||
        (request.route.path as string).startsWith('/myleisure')
      )
        request.body.userId = result.user_id;
    } catch (e) {
      if (!(request.route.path as string).startsWith('/myleisure')) {
        this.logger.warn('Authentication failed - Invalid token', {
          context: 'AuthGuard',
          method: request.method,
          url: request.url,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        });
        throw new UnauthorizedException();
      }
      return true;
    }
    return true;
  }

  extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
