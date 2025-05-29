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
    type: 'timestamp with time zone',
    nullable: true,
  })
  startTime: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  endTime: Date;
}
