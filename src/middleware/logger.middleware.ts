import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startTime = Date.now();
    const { ip, method, originalUrl, headers, body } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || this.generateRequestId();
    request['requestId'] = requestId;

    const maskedBody = { ...body };
    if (maskedBody.password) {
      maskedBody.password = '******'; // 비밀번호 마스킹
    }
    const hasFiles =
      (request.files && request.files instanceof Array && request.files.length > 0) ||
      (typeof request.files === 'object' && Object.keys(request.files).length > 0);

    this.logger.info(`HTTP Request started`, {
      context: 'HttpLoggerMiddleware',
      timestamp: new Date().toISOString(),
      requestId,
      method,
      url: originalUrl,
      ip,
      userAgent,
      body: maskedBody,
      files: hasFiles ? 'Files were uploaded but excluded from logs.' : undefined,
    });

    response.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = response;
      const contentLength = response.get('content-length') || 0;
      const logLevel = this.getLogLevel(statusCode);
      const logMessage = 'HTTP Request completed';

      this.logger[logLevel](logMessage, {
        context: 'HttpLoggerMiddleware',
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        contentLength,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
    });

    next();
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private getLogLevel(statusCode: number): string {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }
}
