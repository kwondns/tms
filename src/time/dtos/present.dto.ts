import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PresentDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsDateString()
  @IsOptional()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime: string;
}
