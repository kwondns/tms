import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'drive' })
export class Notice {
  @PrimaryGeneratedColumn()
  notice_id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: true })
  visible: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
