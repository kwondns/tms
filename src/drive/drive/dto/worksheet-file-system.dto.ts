import { IsObject } from 'class-validator';
import { Worksheet } from '@/drive/worksheet/entities/worksheet.entity';
import { CreateFileSystemDto } from '@/drive/drive/dto/file-system.dto';
import { User } from '@/drive/user/entities/user.entity';

export class CreateWorksheetFileSystemDto extends CreateFileSystemDto {
  @IsObject()
  worksheet: Worksheet;
}

export class NewWorksheetFileSystemDto extends CreateWorksheetFileSystemDto {
  @IsObject()
  user: User;
}
