import { IsEmail, IsJWT, IsString, IsStrongPassword, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class RequestResetPasswordDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;
}

export class VerifyResetPasswordDto {
  @IsUUID()
  userId: string;

  @IsJWT()
  passwordResetToken: string;
}

export class UpdatePasswordDto extends VerifyResetPasswordDto {
  @IsStrongPassword(
    { minSymbols: 1, minLength: 8, minNumbers: 1, minLowercase: 0, minUppercase: 0 },
    { message: '비밀번호는 최소 8자리 이상이며, 숫자와 특수문자를 각각 1개 이상 포함해야 합니다.' },
  )
  password: string;
}

export class UpdateUserDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;
}

export class UpdateUserResponseDto {
  @Expose()
  name: string;
}
