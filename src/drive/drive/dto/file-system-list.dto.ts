import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ListCategory {
  FOLDER = 'folder',
  WORKSHEET = 'worksheet',
  SCHEMATIC = 'schematic',
  ETC = 'etc',
  PATTERN = 'pattern',
  PRINT = 'print',
  WIIVE = 'wiive',
  FABRIC = 'fabric',
}

export enum ListTarget {
  STARRED = 'starred',
  TRASH = 'trash',
}

export class FindDriveAllDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value), { toClassOnly: true })
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ListTarget)
  target?: ListTarget;

  @IsOptional()
  @IsString()
  path?: string;
}

export class FindDriveWithCategoryDto extends FindDriveAllDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value), { toClassOnly: true })
  @IsString()
  search?: string;

  @IsEnum(ListCategory)
  category: ListCategory;

  @Transform(({ value }) => (value === '' ? 1 : parseInt(value, 10)), { toClassOnly: true }) // 기본값 설정
  @IsNumber()
  page: number = 1;
}
