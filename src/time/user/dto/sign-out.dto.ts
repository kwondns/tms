import { IsUUID } from 'class-validator';

export class SignOutDto {
  @IsUUID()
  userId: string;
}
