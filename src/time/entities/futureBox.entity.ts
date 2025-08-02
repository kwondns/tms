import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ViewEntity,
} from 'typeorm';
import { Future } from '@/time/entities/future.entity';

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
      fb.updated_at,
      fb.order,
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
    LEFT JOIN timeline.future f ON fb.id = f.future_box_id
    GROUP BY fb.id, fb.title, fb.type, fb.created_at, fb.updated_at, fb.order
`,
})
export class FutureBoxProgressView {
  @Column()
  id: string;

  @Column()
  title: string;

  @Column()
  type: FutureBoxType;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;

  @Column()
  order: number;

  @Column({ type: 'float' })
  progress_ratio: number;

  @Column()
  total_futures: number;

  @Column()
  completed_futures: number;
}
