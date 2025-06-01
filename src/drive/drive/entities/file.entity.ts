import { ChildEntity, Column } from 'typeorm';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { FileTag } from '@/drive/drive/dto/file.dto';

@ChildEntity()
export class File extends FileSystem {
  @Column({ type: 'enum', enum: FileTag })
  tag: FileTag;

  @Column()
  size: number;

  @Column()
  mimetype: string;

  @Column()
  storage_path: string;
}
