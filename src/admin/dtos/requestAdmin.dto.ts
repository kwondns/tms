import { IsString } from 'class-validator';

export class RequestAdminDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
