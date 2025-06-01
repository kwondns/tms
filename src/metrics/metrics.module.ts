import { Module } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: '전체 http 요청 수',
      labelNames: ['method', 'route'],
    }),
    makeCounterProvider({
      name: 'http_response_status',
      help: '상태 코드별 HTTP 응답 수',
      labelNames: ['method', 'status', 'http'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP 요청 처리 시간(초)',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5], // 실무에 적합한 버킷 설정
    }),
  ],
  exports: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: '전체 http 요청 수',
      labelNames: ['method', 'route'],
    }),
    makeCounterProvider({
      name: 'http_response_status',
      help: '상태 코드별 HTTP 응답 수',
      labelNames: ['method', 'status', 'http'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP 요청 처리 시간(초)',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5], // 실무에 적합한 버킷 설정
    }),
  ],
})
export class MetricsModule {}
