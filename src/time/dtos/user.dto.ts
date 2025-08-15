import { IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserDto {
  @IsUUID()
  userId: string;
}

export class UserResponseDto {
  @Expose()
  userId: string;

  @Expose()
  name: string;
}
