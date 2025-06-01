import { BadRequestException, Injectable } from '@nestjs/common';
import { VerificationEmailDto } from '@/drive/user/dto/verification-email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailAuth } from '@/drive/user/entities/email-auth.entity';
import { Repository } from 'typeorm';
import { MailService } from '@/drive/mail/mail.service';

@Injectable()
export class EmailAuthService {
  constructor(
    @InjectRepository(EmailAuth) private readonly emailAuthRepo: Repository<EmailAuth>,
    private readonly mailService: MailService,
  ) {}

  /**
   * 새로운 인증 코드 발행 및 메일 전송
   * @param verificationEmail
   */
  async generateAndSendEmailVerificationCode(verificationEmail: VerificationEmailDto) {
    const verification = this.emailAuthRepo.create(verificationEmail);
    await this.emailAuthRepo.save(verification);
    return await this.mailService.verificationEmail(verification.email, verification.code);
  }

  /**
   * 재인증 시 기존 인증코드 제거
   * @param verificationEmail
   */
  async deleteVerificationEmail(verificationEmail: VerificationEmailDto) {
    await this.emailAuthRepo.delete(verificationEmail);
  }

  /**
   * 등록된 인증 대기가 있는지 확인
   * @param verificationEmail
   */
  async isAlreadyExistVerificationCode(verificationEmail: VerificationEmailDto) {
    if (await this.emailAuthRepo.findOne({ where: verificationEmail }))
      await this.deleteVerificationEmail(verificationEmail);
    return verificationEmail;
  }

  /**
   * 등록된 인증 대기가 있는지 확인
   * @param email
   */
  async checkEmailVerificationExist(email: string) {
    const emailAuth = await this.emailAuthRepo.findOne({ where: { email } });
    if (!emailAuth) {
      throw new BadRequestException('인증번호를 재발송 해주세요.');
    }
    return emailAuth;
  }

  /**
   * 입력한 코드와 저장된 코드의 일치 여부 판단
   * @param code - 사용자 입력 인증 코드
   * @param emailAuth - DB에 저장된 데이터
   */
  async checkEmailVerificationCode(code: number, emailAuth: EmailAuth) {
    if (emailAuth.code === code) return emailAuth;
    throw new BadRequestException('잘못된 코드입니다.');
  }

  /**
   * 인증 번호 만료 여부 판단
   * @param emailAuth - DB에 저장된 데이터
   */
  async checkEmailVerificationIsExpired(emailAuth: EmailAuth) {
    if (emailAuth.expired_at >= new Date()) return emailAuth;
    await this.deleteVerificationEmail({ email: emailAuth.email });
    throw new BadRequestException('유효시간이 만료되었습니다.');
  }

  async updateEmailVerificationState(emailAuth: EmailAuth) {
    emailAuth.is_verified = true;
    emailAuth.created_at = new Date(emailAuth.created_at.getTime() - 3 * 60 * 1000);
    return await this.emailAuthRepo.save(emailAuth);
  }
}
