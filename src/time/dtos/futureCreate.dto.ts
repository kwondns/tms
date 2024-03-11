import { IsBoolean, IsString } from 'class-validator';

export class FutureCreateDto {
  @IsString()
  content: string;

  @IsBoolean()
  checked: boolean;

  @IsString()
  boxId: string;
}
