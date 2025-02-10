import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

const logDir = 'logs';

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./${logDir}/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: '14d',
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike('YourAppName', {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('TMS', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('error')),
  ],
};
