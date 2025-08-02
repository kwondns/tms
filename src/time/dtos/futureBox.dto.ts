import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FutureBoxDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsBoolean()
  @IsOptional()
  checked: boolean;

  @IsNumber()
  @IsOptional()
  order: number;
}
