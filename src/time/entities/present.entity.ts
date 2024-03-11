import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'timeline' })
export class Present {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({
    type: `${process.env.NODE_ENV === 'production' ? 'timestamp with time zone' : 'datetime'}`,
    nullable: true,
  })
  startTime: Date;

  @Column({
    type: `${process.env.NODE_ENV === 'production' ? 'timestamp with time zone' : 'datetime'}`,
    nullable: true,
  })
  endTime: Date;
}
