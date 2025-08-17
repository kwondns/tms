// interceptors/cache-key-header.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CacheKeyHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const userId = request.body.userId ?? 'guest';
    response.vary('x-cache-key');
    response.setHeader('x-cache-key', `uid-${userId}`);
    response.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=60');
    response.setHeader('CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=60');

    return next.handle();
  }
}
