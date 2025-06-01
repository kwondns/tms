import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { User } from '@/drive/user/entities/user.entity';
import { Expose, Transform, Type } from 'class-transformer';
import { FileTag } from '@/drive/drive/dto/file.dto';
import mime from 'mime-types';

export class CreateFileSystemDto {
  @IsString()
  @IsOptional()
  parentId: string | null;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  is_root?: boolean;
}

export class NewFileSystemDto extends CreateFileSystemDto {
  @IsObject()
  user: User;
}

export type FileSystemType = 'folder' | 'file' | 'worksheet';

export class FileSystemResponseDataDto {
  @Expose({ name: 'id' })
  fileSystemId: string;

  @Expose()
  name: string;

  @Expose()
  path: string;

  @Expose({ name: 'id_path' })
  idPath: string;

  @Expose()
  type: FileSystemType;

  @Expose({ name: 'is_starred' })
  isStarred: boolean;

  @Expose({ name: 'is_root' })
  isRoot: boolean;

  @Expose({ name: 'children_count' })
  childrenCount: number;

  @Expose({ name: 'starred_at' })
  starredAt: Date;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Expose({ name: 'deleted_at' })
  deletedAt: Date;

  @Expose()
  tag: FileTag;

  @Expose()
  size: number;

  @Transform(({ obj }) => obj.mimetype && mime.extension(obj.mimetype))
  @Expose()
  mimetype: string;

  @Transform(({ obj }) => obj.parent?.id)
  @Expose()
  parentId: string;

  @Expose({ name: 'storage_path' })
  storagePath: string;

  @Transform(({ obj }) => obj.worksheet?.worksheet_id)
  @Expose()
  worksheetId: string;

  @Transform(({ obj }) => obj.worksheet?.thumb_img)
  @Expose()
  thumbImg: string;

  @Transform(({ obj }) => obj.worksheet?.requester)
  @Expose()
  requester: string;

  @Transform(({ obj }) => obj.user?.user_storage.storage_limit)
  @Expose()
  storageLimit: number;

  @Transform(({ obj }) => obj.user?.user_storage.storageUsed)
  @Expose()
  storageUsed: number;
}

export class FileSystemDriveAllResponseDto {
  @Type(() => FileSystemResponseDataDto)
  @Expose()
  folders: FileSystemResponseDataDto[];

  @Type(() => FileSystemResponseDataDto)
  @Expose()
  files: FileSystemResponseDataDto[];

  @Expose()
  idPath: string;

  @Expose()
  path: string;
}

export class FileSystemDriveResponseDto {
  @Expose()
  count: number;

  @Type(() => FileSystemResponseDataDto)
  @Expose()
  data: FileSystemResponseDataDto[];

  @Expose()
  idPath: string;

  @Expose()
  path: string;
}
