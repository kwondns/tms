import { IsEmail, IsJWT, IsOptional, IsString, IsStrongPassword, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class RequestResetPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyResetPasswordDto {
  @IsUUID()
  userId: string;

  @IsJWT()
  passwordResetToken: string;
}

export class UpdatePasswordDto extends VerifyResetPasswordDto {
  @IsStrongPassword()
  password: string;
}

export class UpdateUserDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  profileImg: string;
}

export class UpdateUserResponseDto {
  @Expose({ name: 'profile_img' })
  profileImg: string;

  @Expose()
  name: string;
}
