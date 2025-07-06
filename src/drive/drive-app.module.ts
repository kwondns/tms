import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@/utils/logger';
import { RouterModule } from '@nestjs/core';
// import { LoggingInterceptor } from '@/interceptors/logger.interceptor';
import { UserModule } from '@/drive/user/user.module';
import { MailModule } from '@/drive/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import appConfig from '@/drive/app.config';
import { WorksheetModule } from '@/drive/worksheet/worksheet.module';
import { DriveModule } from '@/drive/drive/drive.module';
import { ScheduleModule } from '@nestjs/schedule';
import { S3Module } from '@/drive/s3/s3.module';
import { BullModule } from '@nestjs/bullmq';
import { NoticeModule } from '@/drive/notice/notice.module';
import { PermissionModule } from '@/drive/permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [process.env.NODE_ENV === 'production' ? '.env' : `.env.development`],
      load: [appConfig],
    }),
    JwtModule.register({
      global: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.ELASTICACHE_HOST,
        port: process.env.ELASTICACHE_PORT as unknown as number,
      },
      extraOptions: {
        manualRegistration: true,
      },
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    MailModule,
    UserModule,
    WorksheetModule,
    DriveModule,
    S3Module,
    NoticeModule,
    PermissionModule,
    RouterModule.register([
      {
        path: 'drive',
        module: UserModule,
      },
      {
        path: 'drive',
        module: WorksheetModule,
      },
      {
        path: 'drive',
        module: DriveModule,
      },
      {
        path: 'drive',
        module: S3Module,
      },
      {
        path: 'drive',
        module: NoticeModule,
      },
    ]),
  ],
  // providers: [
  //   { provide: APP_GUARD, useClass: AuthGuard },
  //   { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  // ],
})
export class DriveAppModule {}
