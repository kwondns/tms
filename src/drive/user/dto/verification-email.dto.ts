import { IsEmail, IsNumber, Max, Min } from 'class-validator';
import { Expose } from 'class-transformer';

export class VerificationEmailDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;
}

export class CheckVerificationEmailDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;

  @IsNumber({}, { message: '인증 코드는 숫자만 입력 가능합니다.' })
  @Min(100000, { message: '인증 코드는 정확히 6자리여야 합니다.' })
  @Max(999999, { message: '인증 코드는 정확히 6자리여야 합니다.' })
  code: number;
}

export class ResponseCheckVerificationEmailDto {
  @Expose({ name: 'is_verified' })
  isVerified: boolean;
}
