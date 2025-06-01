import { Expose, Transform, Type } from 'class-transformer';

export class WorksheetResponseDataDto {
  @Expose({ name: 'worksheet_id' })
  worksheetId: string;

  @Expose()
  name: string;

  @Expose({ name: 'thumb_img' })
  thumbImg: string;

  @Expose()
  gender: number;

  @Expose()
  category: number;

  @Expose()
  clothes: string;

  @Expose()
  requester: string;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Transform(({ obj }) => obj.worksheet_file_system?.type)
  @Expose()
  type: string;

  @Transform(({ obj }) => obj.worksheet_file_system?.id)
  @Expose()
  fileSystemId: string;

  @Transform(({ obj }) => obj.worksheet_file_system?.name)
  @Expose()
  fileName: string;

  @Transform(({ obj }) => obj.worksheet_file_system?.path)
  @Expose()
  filePath: string;

  @Transform(({ obj }) => obj.worksheet_file_system?.is_starred)
  @Expose()
  isStarred: boolean;

  @Transform(({ obj }) => obj.worksheet_file_system?.starred_at)
  @Expose()
  starredAt: Date | null;

  @Transform(({ obj }) => obj.worksheet_file_system?.parent.id)
  @Expose()
  parentId: string;
}

export class WorksheetResponseDto {
  @Type(() => WorksheetResponseDataDto)
  @Expose()
  data: WorksheetResponseDataDto[];

  @Expose()
  count: number;
}
