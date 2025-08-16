import { IsDate, IsEmail, IsObject, IsString, IsStrongPassword } from 'class-validator';
import { Expose } from 'class-transformer';
import { User } from '@/time/user/entities/user.entity';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minSymbols: 1, minLength: 8, minNumbers: 1, minLowercase: 0, minUppercase: 0 })
  password: string;
}

export class TokenServiceDto {
  @IsObject()
  user: User;

  @IsString()
  accessToken: string;

  @IsDate()
  accessTokenExpiresAt: Date;
}

export class SignInResponseDto {
  @Expose({ name: 'user_id' })
  userId: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose({ name: 'is_initialized' })
  isInitialized: boolean;

  @Expose()
  accessToken: string;

  @Expose()
  accessTokenExpiresAt: Date;

  @Expose()
  refreshToken: string;
}
