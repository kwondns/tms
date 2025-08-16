import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { Future } from '@/time/entities/future.entity';
import { User } from '@/time/user/entities/user.entity';

export enum FutureBoxType {
  progress = 'progress',
  check = 'check',
}

@Entity({ schema: 'timeline' })
export class FutureBox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ enum: FutureBoxType })
  type: FutureBoxType;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => Future, (future) => future.future_box)
  future: Future[];

  @Column()
  @Generated('increment')
  order: number;

  @Column({ default: false })
  checked: boolean;

  @ManyToOne(() => User, (user) => user.future_box)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@ViewEntity({
  schema: 'timeline',
  name: 'future_box_progress_view',
  expression: `
    SELECT 
      fb.id,
      fb.title,
      fb.type,
      fb.created_at,
      fb.user_id,
      fb.updated_at,
      fb.order,
      fb.checked,
      CASE 
        WHEN fb.type = 'check' THEN 
          COALESCE(
            CAST(SUM(CASE WHEN f.checked = true THEN 1 ELSE 0 END) AS FLOAT) / 
            NULLIF(COUNT(f.id), 0), 
            0
          )
        WHEN fb.type = 'progress' THEN 
          COALESCE(
            CAST(SUM(CASE WHEN f.percentage = 100 THEN 1 ELSE 0 END) AS FLOAT) / 
            NULLIF(COUNT(f.id), 0), 
            0
          )
        ELSE 0
      END as progress_ratio,
      COUNT(f.id) as total_futures,
      CASE 
        WHEN fb.type = 'check' THEN SUM(CASE WHEN f.checked = true THEN 1 ELSE 0 END)
        WHEN fb.type = 'progress' THEN SUM(CASE WHEN f.percentage = 100 THEN 1 ELSE 0 END)
        ELSE 0
      END as completed_futures
    FROM timeline.future_box fb
    LEFT JOIN timeline.future f ON fb.id = f.future_box_id AND fb.user_id = f.user_id
    GROUP BY fb.id, fb.title, fb.type, fb.created_at, fb.updated_at, fb.order, fb.checked, fb.user_id
`,
})
export class FutureBoxProgressView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  user_id: string;

  @ViewColumn()
  title: string;

  @ViewColumn()
  type: FutureBoxType;

  @ViewColumn()
  created_at: string;

  @ViewColumn()
  updated_at: string;

  @ViewColumn()
  order: number;

  @ViewColumn()
  progress_ratio: number;

  @ViewColumn()
  total_futures: number;

  @ViewColumn()
  completed_futures: number;

  @ViewColumn()
  checked: boolean;
}
