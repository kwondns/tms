import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ default: 0 })
  refresh_token_version: number;

  @Column({
    nullable: true,
    type: 'timestamp with time zone',
  })
  refresh_token_expires_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date | null;
}
