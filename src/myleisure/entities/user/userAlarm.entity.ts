import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Alarm } from '@/myleisure/entities/user/alarm.entity';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';

@Entity('user_alarm', { schema: 'myleisure' })
export class UserAlarm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 43, nullable: true })
  user_id?: string;

  @Column({ nullable: true })
  alarm_id?: number;

  @Column({ default: false })
  is_read?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @ManyToOne(() => Alarm, (alarm) => alarm.user_alarm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alarm_id' })
  alarm?: Alarm;

  @ManyToOne(() => UserAuth, (userAuth) => userAuth.user_alarm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_auth?: UserAuth;
}
