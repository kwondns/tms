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

  @Column({
    type: `${process.env.NODE_ENV === 'production' ? 'timestamp with time zone' : 'datetime'}`,
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
  expression:
    process.env.NODE_ENV === 'production'
      ? `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM portfolio.back_stack
               GROUP BY category`
      : `SELECT category,
       GROUP_CONCAT(name) AS name,
       GROUP_CONCAT(url) AS url,
       GROUP_CONCAT(img) AS img
FROM back_stack
GROUP BY category;
`,
})
export class BackStackByCategory extends StackByCategory {}

@ViewEntity({
  schema: 'portfolio',
  expression:
    process.env.NODE_ENV === 'production'
      ? `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM portfolio.front_stack
               GROUP BY category;
      `
      : `SELECT category,
                GROUP_CONCAT(name) AS name,
                GROUP_CONCAT(url)  AS url,
                GROUP_CONCAT(img)  AS img
         FROM front_stack
         GROUP BY category;
      `,
})
export class FrontStackByCategory extends StackByCategory {}

@ViewEntity({
  schema: 'portfolio',
  expression:
    process.env.NODE_ENV === 'production'
      ? `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM portfolio.etc_stack
               GROUP BY category;
  `
      : `SELECT category,
       GROUP_CONCAT(name) AS name,
       GROUP_CONCAT(url) AS url,
       GROUP_CONCAT(img) AS img
FROM etc_stack
GROUP BY category;
`,
})
export class EtcStackByCategory extends StackByCategory {}
