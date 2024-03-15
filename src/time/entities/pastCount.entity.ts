import { Column, Entity, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from 'typeorm';

@Entity({ schema: 'timeline' })
export class PastCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: `${process.env.NODE_ENV === 'production' ? 'timestamp with time zone' : 'datetime'}` })
  date: Date;

  @Column({ type: 'int' })
  count: number;
}
@ViewEntity({
  schema: 'timeline',
  expression:
    process.env.NODE_ENV === 'production'
      ? `
      SELECT pc.id,
             pc.date::date AS date,
             pc.count,
             array_agg(p.title) AS titles,
             count(p.title)     AS titles_count
      FROM timeline.past_count pc
               LEFT JOIN timeline.past p ON pc.date::date = (p."startTime" AT TIME ZONE 'Asia/Seoul'::text)::date
      GROUP BY pc.id;
  `
      : `SELECT pc.id,
                pc.date,
                pc.count,
                GROUP_CONCAT(p.title) AS titles,
                count(p.title)        AS titles_count
         FROM timeline.past_count pc
                  LEFT JOIN timeline.past p ON pc.date = (p."startTime" AT TIME ZONE 'Asia/Seoul'::text)
         GROUP BY pc.id;`,
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
