import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Catch()
@Injectable()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorDetails = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // 로그 레벨 결정
    const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    const errorCategory = this.categorizeError(exception);
    this.logger[logLevel]('HTTP Exception occurred', {
      context: 'GlobalExceptionFilter',
      statusCode: status,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      message,
      errorCategory,
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error && { stack: exception.stack }),
    });

    response.status(status).json(errorDetails);
  }

  private categorizeError(exception: unknown): string {
    if (exception instanceof ConflictException) return 'business';
    if (exception instanceof ValidationPipe) return 'validation';
    if (exception instanceof UnauthorizedException) return 'security';
    return 'system';
  }
}
