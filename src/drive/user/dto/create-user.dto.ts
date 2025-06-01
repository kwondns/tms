import { IsBoolean, IsEmail, IsNumber, IsString, IsStrongPassword } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({ minSymbols: 1, minLength: 8, minNumbers: 1, minLowercase: 0, minUppercase: 0 })
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

export class CreateOAuthUserDto {
  @IsString()
  user_id: string;

  @IsString()
  name: string;

  @IsNumber()
  social: number;

  @IsString()
  profile_img: string;
}
