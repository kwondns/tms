import { IsString } from 'class-validator';

export class StackDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsString()
  img: string;

  @IsString()
  category: string;
}
