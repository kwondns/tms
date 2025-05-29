import { Column, Entity, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from 'typeorm';

export abstract class Stack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  img: string;

  @Column({ default: false })
  recent: boolean;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: string;

  @Column()
  category: string;
}

@Entity({ schema: 'portfolio' })
export class BackStack extends Stack {}

@Entity({ schema: 'portfolio' })
export class FrontStack extends Stack {}

@Entity({ schema: 'portfolio' })
export class EtcStack extends Stack {}

export abstract class StackByCategory {
  @ViewColumn()
  category: string;

  @ViewColumn()
  name: string[];

  @ViewColumn()
  url: string[];

  @ViewColumn()
  img: string[];
}

@ViewEntity({
  schema: 'portfolio',
  expression: `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM portfolio.back_stack
               WHERE recent = true
               GROUP BY category`,
})
export class BackStackByCategory extends StackByCategory {}

@ViewEntity({
  schema: 'portfolio',
  expression: `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM portfolio.front_stack
               WHERE recent = true
               GROUP BY category;
      `,
})
export class FrontStackByCategory extends StackByCategory {}

@ViewEntity({
  schema: 'portfolio',
  expression: `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM portfolio.etc_stack
               WHERE recent = true
               GROUP BY category;
  `,
})
export class EtcStackByCategory extends StackByCategory {}
