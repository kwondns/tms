import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Future } from './future.entity';

@Entity({ schema: 'timeline' })
export class FutureBox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  priority: number;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => Future, (future) => future.box)
  future: Future;

  @Column()
  @Generated('increment')
  order: number;

  @Column({ default: false })
  checked: boolean;
}
