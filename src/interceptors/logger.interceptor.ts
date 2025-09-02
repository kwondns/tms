import { Injectable, Inject, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    const request = context.switchToHttp().getRequest<Request>();

    const { originalUrl } = request;
    const requestId = request['requestId'];
    const handler = context.getHandler();
    const controller = context.getClass();

    this.logger.debug('Business logic started', {
      context: 'BusinessLoggerInterceptor',
      requestId,
      controller: controller.name,
      handler: handler.name,
    });

    if (originalUrl === '/health' || originalUrl === '/metrics') return next.handle();

    return next.handle().pipe(
      tap((data) => {
        // 응답 시간 계산
        const duration = Date.now() - startTime;

        // 응답 로깅
        this.logger.info('Business logic completed', {
          context: 'BusinessLoggerInterceptor',
          requestId,
          controller: controller.name,
          handler: handler.name,
          duration: `${duration}ms`,
          responseSize: this.getDataSize(data),
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // 비즈니스 로직 에러 로그 (Controller/Service에서 발생한 에러)
        this.logger.error('Business logic failed', {
          context: 'BusinessLoggerInterceptor',
          requestId,
          controller: controller.name,
          handler: handler.name,
          duration: `${duration}ms`,
          error: error.message,
          errorName: error.constructor.name,
          // 개발 환경에서만 스택 트레이스 포함
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        });

        throw error; // Exception Filter로 전달
      }),
    );
  }
  private getDataSize(data: any): number {
    if (!data) return 0;
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}
