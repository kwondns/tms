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
import { Token } from '@/time/user/entities/token.entity';
import { PasswordReset } from '@/time/user/entities/password-reset.entity';
import { FutureBox } from '@/time/entities/futureBox.entity';
import { Past } from '@/time/entities/past.entity';
import { PastCount } from '@/time/entities/pastCount.entity';
import { Present } from '@/time/entities/present.entity';
import { Future } from '@/time/entities/future.entity';

@Entity({ schema: 'timeline' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @Column({ default: false })
  is_initialized: boolean;

  @OneToOne(() => Token, { cascade: true })
  @JoinColumn()
  token: Token;

  @OneToOne(() => PasswordReset, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn()
  password_reset_token: PasswordReset;

  @OneToMany(() => Future, (future) => future.user, { cascade: true })
  future: Future[];

  @OneToMany(() => FutureBox, (futureBox) => futureBox.user, { cascade: true })
  future_box: FutureBox[];

  @OneToMany(() => Past, (past) => past.user, { cascade: true })
  past: Past[];

  @OneToMany(() => PastCount, (pastCount) => pastCount.user, { cascade: true })
  past_count: PastCount[];

  @OneToOne(() => Present, (present) => present.user, { cascade: true })
  present: Present;
}
