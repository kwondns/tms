import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  CheckVerificationEmailDto,
  ResponseCheckVerificationEmailDto,
  VerificationEmailDto,
} from '@/drive/user/dto/verification-email.dto';
import { Public } from '@/decorators/public.decorator';
import asyncPipe from '@/utils/asyncPipe';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { EmailAuthService } from '@/drive/user/services/email-auth.service';
import { UserService } from '@/drive/user/services/user.service';

@Controller('user')
export class EmailAuthController {
  constructor(
    private readonly emailAuthService: EmailAuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * 이메일 회원가입 시 인증 코드 발행 및 메일 전송
   * 이미 가입된 이메일에는 409 상태코드 반환
   * @param verificationEmail
   */
  @Public()
  @HttpCode(204)
  @Post('email-verification')
  async verificationEmail(@Body() verificationEmail: VerificationEmailDto) {
    const pipeline = await asyncPipe(
      this.userService.isAlreadyRegisteredEmail.bind(this.userService), // 이미 등록된 이메일 여부 확인
      this.emailAuthService.isAlreadyExistVerificationCode.bind(this.emailAuthService), // 이미 인증번호를 받았는지 여부 확인
      this.emailAuthService.generateAndSendEmailVerificationCode.bind(this.emailAuthService), // 인증번호 생성 및 발송
    );
    return await pipeline(verificationEmail);
  }

  /**
   * 이메일 회원가입 시 인증번호 확인
   * 이메일, 코드, 만료기간 중 하나라도 미통과시 400 Bad Request 반환
   * @param checkVerificationEmailDto
   */
  @Serialize(ResponseCheckVerificationEmailDto)
  @Public()
  @HttpCode(200)
  @Post('check-verification-email')
  async checkVerificationEmail(@Body() checkVerificationEmailDto: CheckVerificationEmailDto) {
    const { email, code } = checkVerificationEmailDto;
    const pipeline = await asyncPipe(
      this.emailAuthService.checkEmailVerificationExist.bind(this.emailAuthService), // 인증번호 발급 여부 확인
      this.emailAuthService.checkEmailVerificationCode.bind(this.emailAuthService, code), // 인증번호 일치 여부 확인
      this.emailAuthService.checkEmailVerificationIsExpired.bind(this.emailAuthService), // 인증번호 만료 여부 확인
      this.emailAuthService.updateEmailVerificationState.bind(this.emailAuthService), // 인증번호 확인 후 상태 업데이트
    );

    return await pipeline(email);
  }
}
