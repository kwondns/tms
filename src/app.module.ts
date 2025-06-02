import { Module, NestModule } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '@/admin/admin.module';
import { DatabaseModule } from '@/db/database.module';
import { PortModule } from '@/port/port.module';
import { UploadModule } from '@/upload/upload.module';
import configuration from '@/configuration';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TimeModule } from '@/time/time.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BlogModule } from '@/blog/blog.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@/utils/logger';
import { MetricsModule } from '@/metrics/metrics.module';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { DriveAppModule } from '@/drive/drive-app.module';
import { AuthGuard } from '@/guard/auth.guard';
import { LoggingInterceptor } from '@/interceptors/logger.interceptor';
import { UserModule } from '@/drive/user/user.module';

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
    DriveAppModule,
    MetricsModule,
    TerminusModule,
    HttpModule,
    UserModule,
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 10 }] }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure() {}

  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggerMiddleware).forRoutes('*');
  // }
}
