import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
} from 'typeorm';
import { User } from '@/drive/user/entities/user.entity';
import { Permission } from '@/drive/drive/entities/permission.entity';

@Entity()
@Tree('closure-table')
@TableInheritance({ column: { type: 'varchar', name: 'discriminator' } })
@Unique(['parent', 'name', 'deleted_at'])
export class FileSystem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    collation: 'ko-x-icu',
    transformer: {
      to: (value: string) => value.normalize('NFC'),
      from: (value: string) => value,
    },
  })
  name: string;

  @Column({
    type: 'varchar',
    generatedType: 'STORED',
    asExpression: 'get_choseong(name)',
  })
  choseong: string;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: FileSystem;

  @TreeChildren()
  children: FileSystem[];

  @Column({
    type: 'ltree',
    transformer: {
      to: (value: string) => value.replace(/[^\w.]/g, '_'),
      from: (value: string) => value,
    },
  })
  ltree_path: string;

  @ManyToOne(() => User, (user) => user.file_system, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  id_path: string;

  @Column()
  type: 'file' | 'folder' | 'worksheet';

  @Column({ type: 'boolean', default: false })
  is_starred: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  starred_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @Column({ nullable: true })
  discriminator: string;

  @OneToMany(() => Permission, (permission) => permission.file_system)
  permissions: Permission[];
}
