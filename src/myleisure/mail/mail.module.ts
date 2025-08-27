import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from '@/time/mail/mail.service';
import * as path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigType } from '@nestjs/config';
import AppConfig from '@/app.config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [],
      inject: [AppConfig.KEY],
      useFactory: (config: ConfigType<typeof AppConfig>) => ({
        transport: {
          host: 'smtp.zoho.com',
          port: 465,
          secure: true,
          auth: {
            user: config.auth.mailUser,
            pass: config.auth.mailPassword,
          },
        },
        defaults: {
          from: 'MyLeisure <no-reply@kwondns.com>',
        },
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(), // 템플릿 엔진으로 Handlebars 사용
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
