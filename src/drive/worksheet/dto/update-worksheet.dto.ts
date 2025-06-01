import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStarredWorksheetDto {
  @IsString()
  userId: string;

  @IsUUID()
  worksheetId: string;

  @IsBoolean()
  isStarred: boolean;
}

export class UpdateDeleteWorksheetDto {
  @IsString()
  userId: string;

  @IsUUID()
  worksheetId: string;
}

export class UpdateWorksheetDto {
  @IsUUID()
  worksheetId: string;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  title?: string | null = null;
}
