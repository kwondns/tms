import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FutureDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsBoolean()
  @IsOptional()
  checked: boolean;
}
