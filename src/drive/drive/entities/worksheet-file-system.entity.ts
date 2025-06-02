import { ChildEntity, JoinColumn, OneToOne } from 'typeorm';
import type { Worksheet } from '@/drive/worksheet/entities/worksheet.entity';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';

@ChildEntity({ schema: 'drive' })
export class WorksheetFileSystem extends FileSystem {
  @OneToOne('Worksheet', (worksheet: Worksheet) => worksheet.worksheet_file_system)
  @JoinColumn()
  worksheet: Worksheet;
}
