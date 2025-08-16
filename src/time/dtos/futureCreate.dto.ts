import { IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { User } from '@/time/user/entities/user.entity';

export class FutureCreateDto {
  @IsUUID()
  userId: string;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  priority: number;

  @IsString()
  boxId: string;
}

export class FutureCreateServiceDto extends FutureCreateDto {
  @IsObject()
  user: User;
}
