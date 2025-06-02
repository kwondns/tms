import { IsArray, IsDefined, IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { CreateFileSystemDto } from '@/drive/drive/dto/file-system.dto';
import { User } from '@/drive/user/entities/user.entity';
import { Expose, Transform, Type } from 'class-transformer';

export enum FileTag {
  A = 'A',
  B = 'B',
  ETC = 'etc',
  C = 'C',
  D = 'D',
  E = 'E',
}

export class CreateFilePayloadDto extends CreateFileSystemDto {
  @IsDefined()
  @IsArray()
  @IsEnum(FileTag, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  tags: FileTag[];
}
export class CreateFileDto extends CreateFileSystemDto {
  @IsString()
  storage_path: string;

  @IsNumber()
  size: number;

  @IsString()
  mimetype: string;

  @IsEnum(FileTag)
  tag: FileTag;
}

export class NewFileDto extends CreateFileDto {
  @IsObject()
  user: User;
}

export class S3PutDto extends CreateFilePayloadDto {
  @IsString()
  userId: string;

  @IsObject()
  files: Array<Express.Multer.File>;
}

export class CreateFileResponseDataDto {
  @Expose({ name: 'id' })
  fileSystemId: string;

  @Expose()
  name: string;

  @Expose()
  path: string;

  @Expose()
  type: string;

  @Expose()
  storagePath: string;

  @Expose()
  mimetype: string;

  @Expose()
  tag: string;

  @Expose()
  size: number;
}

class CreateFileUploadResultDto {
  @Expose()
  @Type(() => CreateFileResponseDataDto)
  result: CreateFileResponseDataDto;

  @Expose()
  index: number;

  @Expose()
  success: boolean;

  @Expose()
  originalName: string;
}

export class CreateFileResponseDto {
  @Expose()
  result: CreateFileUploadResultDto;

  @Expose()
  storageUsed: number;

  @Expose()
  storageLimit: number;
}
