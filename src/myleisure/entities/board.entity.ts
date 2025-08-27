import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Alarm } from '@/myleisure/entities/user/alarm.entity';

@Entity('board', { schema: 'myleisure' })
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column()
  category: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ default: true })
  visible?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  display_category?: string;

  @OneToMany(() => Alarm, (alarm) => alarm.board)
  alarm: Alarm[];
}
