import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
});

const logDir = process.env.LOG_DIR ?? './logs';

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
    const entry = {
      '@timestamp': timestamp,
      level: level.toUpperCase(),
      message,
      metadata,
      ...(stack ? { stack } : {}),
    };
    return JSON.stringify(entry);
  }),
);

const createDailyTransport = (level: string) =>
  new winstonDaily({
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `${logDir}/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: '14d',
    zippedArchive: true,
    format: jsonFormat,
    options: { flags: 'a' },
  });

export const winstonConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // 1) stdout 으로 JSON 로그 출력
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: jsonFormat,
    }),

    // 2) 일별 파일 로그
    createDailyTransport('info'),
    createDailyTransport('error'),
  ],
};
