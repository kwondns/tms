import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from 'typeorm';
import { User } from '@/time/user/entities/user.entity';

@Entity({ schema: 'timeline' })
export class PastCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int' })
  count: number;

  @ManyToOne(() => User, (user) => user.past_count)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
@ViewEntity({
  schema: 'timeline',
  expression: `
      SELECT pc.id,
             pc.date::date AS date,
             pc.user_id,
             pc.count,
             array_agg(p.title) AS titles,
             count(p.title)     AS titles_count
      FROM timeline.past_count pc
        LEFT JOIN timeline.past p
      ON pc.date = (p."startTime" AT TIME ZONE 'Asia/Seoul')::date
      AND pc.user_id = p.user_id
      GROUP BY pc.id, pc.user_id;
  `,
})
export class PastCountView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  user_id: string;

  @ViewColumn()
  date: Date;

  @ViewColumn()
  count: number;

  @ViewColumn()
  titles: string[];

  @ViewColumn()
  titles_count: number;
}
