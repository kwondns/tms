import { IsEmail, IsStrongPassword } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minSymbols: 1, minLength: 8, minNumbers: 1, minLowercase: 0, minUppercase: 0 })
  password: string;
}

export class SignInResponseDto {
  @Expose({ name: 'user_id' })
  userId: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose({ name: 'profile_img' })
  profileImg: string;

  @Expose({ name: 'is_initialized' })
  isInitialized: boolean;

  @Expose()
  accessToken: string;

  @Expose()
  accessTokenExpiresAt: Date;

  @Expose()
  social: number;

  @Expose({ name: 'root_folder' })
  rootFolder: string;

  @Expose()
  @Transform(({ obj }) => obj.user_storage.storage_limit)
  storageLimit: number;

  @Expose()
  @Transform(({ obj }) => obj.user_storage.storage_used)
  storageUsed: number;
}
