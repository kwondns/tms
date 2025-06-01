import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   *
   * verification-mail.hbs을 사용한 이메일 인증
   *
   * @param {string} email - 회원가입시 사용되는 이메일
   * @param {number} code - 인증 번호
   *
   * @example
   * const email = 'user@example.com';
   * const code = 123456;
   * await this.verificationEmail(email, code);
   */
  async verificationEmail(email: string, code: number): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증코드 발송 메일입니다.',
      template: './verification-mail',
      context: { code },
    });
  }

  async resetPassword(email: string, data: { name: string; link: string }): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: '비밀번호 재설정 링크 발송 메일입니다.',
      template: './reset-password',
      context: { ...data },
    });
  }
}
