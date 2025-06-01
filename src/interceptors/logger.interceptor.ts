import { Injectable, Inject, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, originalUrl, body } = request;
    if (originalUrl === '/health' || originalUrl === '/metrics') return next.handle();
    const userAgent = request.get('user-agent') ?? '';
    const ip = request.ip;

    // 요청 Body 복사본 생성 후 민감한 정보 마스킹
    const maskedBody = { ...body };
    if (maskedBody.password) {
      maskedBody.password = '******'; // 비밀번호 마스킹
    }

    // 요청 시작 시간 기록
    const startTime = Date.now();

    // 파일 여부 확인
    const hasFiles = request.files && request.files.length > 0;

    // 요청 로깅
    this.logger.info(`Request`, {
      timestamp: new Date().toISOString(),
      method,
      url: originalUrl,
      ip,
      userAgent,
      body: maskedBody,
      files: hasFiles ? 'Files were uploaded but excluded from logs.' : undefined,
    });

    return next.handle().pipe(
      tap(() => {
        // 응답 시간 계산
        const duration = Date.now() - startTime;

        // 응답 로깅
        this.logger.info(`Response`, {
          timestamp: new Date().toISOString(),
          method,
          url: originalUrl,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
        });
      }),
    );
  }
}
