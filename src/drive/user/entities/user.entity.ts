import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agreement } from '@/drive/user/entities/agreement.entity';
import { Token } from '@/drive/user/entities/token.entity';
import { PasswordReset } from '@/drive/user/entities/password-reset.entity';
import { UserStorage } from '@/drive/user/entities/user-storage.entity';
import { Worksheet } from '@/drive/worksheet/entities/worksheet.entity';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { UserPermission } from '@/drive/drive/entities/user-permission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profile_img: string;

  @Column({ default: 'user' })
  role: string;

  @Column()
  social: number;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @Column({ nullable: true })
  delete_survey?: string;

  @Column({ default: false })
  is_initialized: boolean;

  @OneToOne(() => Agreement, { cascade: true })
  @JoinColumn()
  agreement: Agreement;

  @OneToOne(() => Token, { cascade: true })
  @JoinColumn()
  token: Token;

  @OneToOne(() => UserStorage, (userStorage) => userStorage.user, { cascade: true })
  @JoinColumn()
  user_storage: UserStorage;

  @OneToOne(() => PasswordReset, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn()
  password_reset_token: PasswordReset;

  @OneToMany(() => Worksheet, (worksheet) => worksheet.user, {
    cascade: ['soft-remove'],
    orphanedRowAction: 'soft-delete',
  })
  worksheet: Worksheet[];

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  user_permissions: UserPermission[];

  @OneToMany(() => FileSystem, (fileSystem) => fileSystem.owner, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  file_system: FileSystem[];

  @Column({ nullable: true })
  root_folder: string;
}
