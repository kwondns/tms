import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './db/database.module';
import { PortModule } from './port/port.module';
import { UploadModule } from './upload/upload.module';
import configuration from './configuration';
import { APP_PIPE } from '@nestjs/core';
import { TimeModule } from './time/time.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BlogModule } from './blog/blog.module';
import { WinstonModule } from 'nest-winston';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { winstonConfig } from './libs/generateLog';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.aws', process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}.local`],
      load: [configuration],
    }),
    WinstonModule.forRoot(winstonConfig),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AdminModule,
    PortModule,
    UploadModule,
    TimeModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
