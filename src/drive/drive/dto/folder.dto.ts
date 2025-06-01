import { IsArray, IsBoolean, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { Permission } from '@/drive/drive/entities/permission.entity';

export class SaveFolderDto {
  @IsObject()
  fileSystem: FileSystem;

  @IsObject()
  permission: Permission;
}

export class UpdateFolderDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  id: string[];

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  oldName?: string;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsUUID()
  currentId?: string;
}

export class DeleteFolderDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}
