import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/time/user/entities/user.entity';

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

  @OneToOne(() => User, (user) => user.present)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
