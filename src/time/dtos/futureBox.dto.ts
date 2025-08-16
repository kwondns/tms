import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class FutureBoxDto {
  @IsUUID()
  userId: string;

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
