import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindWorksheetDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)), { toClassOnly: true })
  @IsNumber()
  gender?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)), { toClassOnly: true })
  @IsNumber()
  category?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value), { toClassOnly: true })
  @IsString()
  clothes?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value), { toClassOnly: true })
  @IsString()
  name?: string;

  @Transform(({ value }) => (value === '' ? 1 : parseInt(value, 10)), { toClassOnly: true }) // 기본값 설정
  @IsNumber()
  page: number = 1;
}
