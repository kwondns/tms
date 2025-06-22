import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { TokenService } from '@/drive/user/services/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    if (request.route.path === '/metrics') return true;
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();
    try {
      const result = await this.tokenService.validateAccess(token);
      // ! TODO 관리자 계정 생성하여 관리
      if (request.route.path !== '/drive/notice' && (request.route.path as string).startsWith('/drive'))
        request.body.userId = result.user_id;
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
