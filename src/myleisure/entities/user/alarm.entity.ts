import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from '@/myleisure/entities/board.entity';
import { UserAlarm } from '@/myleisure/entities/user/userAlarm.entity';

@Entity('alarm', { schema: 'myleisure' })
export class Alarm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  board_id?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @ManyToOne(() => Board, (board) => board.alarm, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'board_id' })
  board?: Board;

  @OneToMany(() => UserAlarm, (userAlarm) => userAlarm.alarm)
  user_alarm: UserAlarm[];
}
