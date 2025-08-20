import { IsNumber, IsString } from 'class-validator';

export class FutureBoxCreateDto {
  @IsString()
  title: string;

  @IsNumber()
  priority: number;
}
