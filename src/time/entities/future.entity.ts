import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { FutureBox } from '@/time/entities/futureBox.entity';

@Entity({ schema: 'timeline' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Future {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @ManyToOne(() => FutureBox, (futureBox) => futureBox.future)
  @JoinColumn({ name: 'future_box_id' })
  future_box: FutureBox;
}

@ChildEntity()
export class FutureCheck extends Future {
  @Column({ type: 'boolean', default: false })
  checked: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;
}

@ChildEntity()
export class FutureProgress extends Future {
  @Column({ type: 'int', default: 0 })
  percentage: number;
}
