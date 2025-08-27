import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async resetPassword(email: string, data: { name: string; link: string }): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: '[MyLeisure] 비밀번호 재설정 링크 발송 메일입니다.',
      template: './reset-password',
      context: { ...data },
    });
  }
}
