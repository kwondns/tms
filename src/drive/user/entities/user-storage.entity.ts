import { Column, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/drive/user/entities/user.entity';

@Entity({ schema: 'drive' })
export class UserStorage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.user_storage, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: 1024 * 1024 * 1024 }) // 기본 1GB
  storage_limit: number;

  @Column({ default: 0 })
  storage_used: number;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date | null;
}
