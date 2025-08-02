import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FutureCreateDto {
  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  priority: number;

  @IsString()
  boxId: string;
}
