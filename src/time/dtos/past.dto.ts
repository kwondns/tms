import { IsDateString, IsObject, IsString, IsUUID } from 'class-validator';
import { User } from '@/time/user/entities/user.entity';

export class PastDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

export class PastCreateDto extends PastDto {
  @IsObject()
  user: User;
}

export class PastUpdateDto extends PastCreateDto {
  @IsString()
  id: string;
}
