import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum Gender {
  ETC = 0,
  MALE = 1,
  FEMALE = 2,
  KID = 3,
}

export enum Category {
  ETC = 0,
  TOP = 1,
  BOTTOM = 2,
}

export class CreateWorksheetDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsEnum(Gender)
  gender: number;

  @IsEnum(Category)
  category: number;

  @IsString()
  clothes: string;

  @IsString()
  @IsOptional()
  requester: string;

  @IsString()
  parentId: string;
}

export class CreateWorksheetResponseDto {
  @Expose({ name: 'worksheet_id' })
  worksheetId: string;

  @Expose()
  name: string;

  @Expose()
  path: string;

  @Expose()
  type: string;

  @Expose()
  gender: number;

  @Expose()
  category: number;

  @Expose()
  clothes: string;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Expose({ name: 'thumb_img' })
  thumbImg: string;
}
