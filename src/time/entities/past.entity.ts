import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'timeline' })
export class Past {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ type: `${process.env.NODE_ENV === 'production' ? 'timestamp with time zone' : 'datetime'}` })
  startTime: Date;

  @Column({ type: `${process.env.NODE_ENV === 'production' ? 'timestamp with time zone' : 'datetime'}` })
  endTime: Date;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;
}
