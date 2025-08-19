import { IsBoolean, IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  name: string;

  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;

  @IsStrongPassword(
    { minSymbols: 1, minLength: 8, minNumbers: 1, minLowercase: 0, minUppercase: 0 },
    { message: '비밀번호는 최소 8자리 이상이며, 숫자와 특수문자를 각각 1개 이상 포함해야 합니다.' },
  )
  password: string;

  @IsBoolean()
  serviceAgreement: boolean;

  @IsBoolean()
  userAgreement: boolean;
}

export class CreateUserResponseDto {
  @Expose({ name: 'user_id' })
  userId: string;

  @Expose()
  name: string;

  @Expose({ name: 'profile_img' })
  profileImg: string;

  @Expose()
  accessToken: string;

  @Expose()
  accessTokenExpiresAt: Date;
}
