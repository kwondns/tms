import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FutureBoxDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsNumber()
  @IsOptional()
  priority: number;
}
