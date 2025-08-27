import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_deleted', { schema: 'myleisure' })
export class UserDeleted {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn('varchar', { name: 'mail_address', length: 255 })
  mail_address: string;

  @Column('varchar', { name: 'password', length: 255, nullable: true })
  password?: string;

  @Column('int', { name: 'status', nullable: true })
  status?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('int', { name: 'social', nullable: true })
  social?: number;

  @Column('varchar', { name: 'withdraw_survey', length: 50, nullable: true })
  withdraw_survey?: string;

  @Column('timestamp', { name: 'completely_deleted_at', nullable: true })
  completely_deleted_at: Date;

  @Column('varchar', { name: 'token', length: 255, nullable: true })
  token?: string;
}
