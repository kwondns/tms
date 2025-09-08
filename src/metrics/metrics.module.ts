import { Module } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { register } from 'prom-client';

const metricsProviders = [
  makeCounterProvider({
    name: 'http_requests_total',
    help: '전체 http 요청 수',
    labelNames: ['method', 'route', 'service'],
    registers: [register],
  }),
  makeCounterProvider({
    name: 'http_response_status',
    help: '상태 코드별 HTTP 응답 수',
    labelNames: ['method', 'status', 'service'],
    registers: [register],
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP 요청 처리 시간(초)',
    labelNames: ['method', 'route', 'status', 'service'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
  }),
];

@Module({
  imports: [PrometheusModule.register()],
  providers: [...metricsProviders],
  exports: [...metricsProviders],
})
export class MetricsModule {}
