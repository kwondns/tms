import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FutureBox } from '@/time/entities/futureBox.entity';

@Entity({ schema: 'timeline' })
export class Future {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  checked: boolean;

  @Column()
  content: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @ManyToOne(() => FutureBox, (futureBox) => futureBox.future)
  box: FutureBox;
}
