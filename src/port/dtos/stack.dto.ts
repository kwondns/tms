import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class StackDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsString()
  img: string;

  @IsString()
  category: string;

  @IsBoolean()
  recent: boolean;

  @IsOptional()
  @IsString()
  tech?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
