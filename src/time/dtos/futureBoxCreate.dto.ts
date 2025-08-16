import { IsEnum, IsObject, IsString, IsUUID } from 'class-validator';
import { FutureBoxType } from '@/time/entities/futureBox.entity';
import { User } from '@/time/user/entities/user.entity';

export class FutureBoxCreateDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsEnum(FutureBoxType)
  type: FutureBoxType;
}

export class FutureBoxCreateServiceDto extends FutureBoxCreateDto {
  @IsObject()
  user: User;
}
