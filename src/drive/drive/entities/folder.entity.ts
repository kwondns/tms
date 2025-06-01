import { ChildEntity, Column } from 'typeorm';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';

@ChildEntity()
export class Folder extends FileSystem {
  @Column({ default: false })
  is_root: boolean;

  @Column({ default: 0 })
  children_count: number;
}
