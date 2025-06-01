import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env' });
}

const dailyOptions = (level: string) => ({
  level,
  datePattern: 'YYYY-MM-DD',
  dirname: `${process.env.LOG_DIR ?? './logs'}/${level}`,
  filename: `%DATE%.${level}.log`,
  maxFiles: '14d',
  zippedArchive: true,
  format: commonFormat(false), // 공통 형식 재사용
});
const commonFormat = (colors: boolean) =>
  winston.format.combine(
    winston.format.timestamp(),
    nestWinstonModuleUtilities.format.nestLike('TMS-BE', {
      colors,
      prettyPrint: true,
    }),
  );

export const winstonConfig = {
  transports: [
    new LokiTransport({
      host: `${process.env.LOKI_HOST}:${process.env.LOKI_PORT}`,
      json: true, // JSON 형식 사용
      batching: true, // 배치 처리 활성화
      replaceTimestamp: true, // 타임스탬프 교체 (최신 버전에서는 기본값)
      labels: { job: 'nestjs', app: 'tms', env: process.env.NODE_ENV },
      format: commonFormat(false),
      interval: 5, // 5초마다 로그 전송 (기본값)
      onConnectionError: (err) => console.error('Loki 연결 실패:', err),
    }),
    new winston.transports.Console({
      level: 'info',
      format: commonFormat(true),
    }),
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('error')),
  ],
};
