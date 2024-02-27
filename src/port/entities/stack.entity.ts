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

@Entity()
export class BackStack extends Stack {}

@Entity()
export class FrontStack extends Stack {}

@Entity()
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
  expression:
    process.env.NODE_ENV === 'production'
      ? `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM backstack
               GROUP BY category`
      : `SELECT category,
       GROUP_CONCAT(name) AS name,
       GROUP_CONCAT(url) AS url,
       GROUP_CONCAT(img) AS img
FROM backstack
GROUP BY category;
`,
})
export class BackStackByCategory extends StackByCategory {}

@ViewEntity({
  expression:
    process.env.NODE_ENV === 'production'
      ? `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM front_stack
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
  expression:
    process.env.NODE_ENV === 'production'
      ? `SELECT category,
                      ARRAY_AGG(name)::text[] AS name, ARRAY_AGG(url)::text[]  AS url, ARRAY_AGG(img) ::text[]  AS img
               FROM etc_stack
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
