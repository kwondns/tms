import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/drive/user/entities/user.entity';
import type { WorksheetFileSystem } from '@/drive/drive/entities/worksheet-file-system.entity';

@Entity()
export class Worksheet {
  @PrimaryGeneratedColumn('uuid')
  worksheet_id: string;

  @OneToOne('WorksheetFileSystem', (worksheetFileSystem: WorksheetFileSystem) => worksheetFileSystem.worksheet, {
    onDelete: 'CASCADE',
  })
  worksheet_file_system: WorksheetFileSystem;

  @ManyToOne(() => User, (user) => user.worksheet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  thumb_img: string;

  @Column({ type: 'int', comment: '0: 기타, 1: 남성, 2: 여성, 3: 아동' })
  gender: number;

  @Column({ type: 'int', comment: '0: 기타, 1: 상의, 2: 하의' })
  category: number;

  @Column({ comment: '의상 종류' })
  clothes: string;

  @Column({ nullable: true, comment: '의뢰처' })
  requester: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone' })
  updated_at: Date;
}
