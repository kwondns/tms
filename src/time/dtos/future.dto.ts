import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class FutureDto {
  @IsUUID()
  userId: string;

  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsBoolean()
  @IsOptional()
  checked: boolean;

  @IsNumber()
  @IsOptional()
  percentage: number;
}
