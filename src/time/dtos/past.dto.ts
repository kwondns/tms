import { IsDateString, IsString } from 'class-validator';

export class PastDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
