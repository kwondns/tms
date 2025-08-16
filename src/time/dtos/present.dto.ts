import { IsDateString, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { User } from '@/time/user/entities/user.entity';

export class PresentDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsDateString()
  @IsOptional()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime: string;
}

export class PresentUpdateServiceDto extends PresentDto {
  @IsObject()
  user: User;
}
