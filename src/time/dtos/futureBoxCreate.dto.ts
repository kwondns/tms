import { IsEnum, IsString } from 'class-validator';
import { FutureBoxType } from '@/time/entities/futureBox.entity';

export class FutureBoxCreateDto {
  @IsString()
  title: string;

  @IsEnum(FutureBoxType)
  type: FutureBoxType;
}
