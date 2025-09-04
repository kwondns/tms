import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total') private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_response_status') private readonly httpResponseStatus: Counter<string>,
    @InjectMetric('http_request_duration_seconds') private readonly httpRequestDurationSeconds: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;
    const start = Date.now();
    const route = req.route?.path ?? req.path ?? req.url ?? 'unknown';

    if (route === '/metrics') {
      return next.handle();
    }

    // 요청 카운트 증가
    this.httpRequestsTotal.inc({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000;
          const status = context.switchToHttp().getResponse().statusCode;

          this.httpResponseStatus.inc({ method, status: status.toString() });
          this.httpRequestDurationSeconds.observe({ method, route, status: status.toString() }, duration);
        },
        error: (err) => {
          const duration = (Date.now() - start) / 1000;
          const status = err.status ?? 500;

          this.httpResponseStatus.inc({ method, status: status.toString() });
          this.httpRequestDurationSeconds.observe({ method, route, status: status.toString() }, duration);
        },
      }),
    );
  }
}
