import { Column, Entity, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from 'typeorm';

@Entity({ schema: 'timeline_legacy' })
export class PastCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int' })
  count: number;
}
@ViewEntity({
  schema: 'timeline_legacy',
  expression: `
      SELECT pc.id,
             pc.date::date AS date,
             pc.count,
             array_agg(p.title) AS titles,
             count(p.title)     AS titles_count
      FROM timeline_legacy.past_count pc
        LEFT JOIN timeline_legacy.past p
      ON pc.date = (p."startTime" AT TIME ZONE 'Asia/Seoul')::date
      GROUP BY pc.id;
  `,
})
export class PastCountView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  date: Date;

  @ViewColumn()
  count: number;

  @ViewColumn()
  titles: string[];

  @ViewColumn()
  titles_count: number;
}
