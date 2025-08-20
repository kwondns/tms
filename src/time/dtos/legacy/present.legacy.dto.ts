import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PresentDto {
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
