import { Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { UserAuth } from './userAuth.entity';

@Entity('user_token', { schema: 'myleisure' })
export class UserToken {
  @PrimaryColumn('varchar', { length: 43, name: 'user_id' })
  user_id: string;

  @Column('varchar', { length: 255, name: 'refresh_token' })
  refresh_token: string;

  @Column('int', { name: 'token_version' })
  token_version: number;

  @Column('int', { name: 'expires_at' })
  expires_at: number;

  @CreateDateColumn()
  created_at: Date;

  @Column('varchar', { length: 255, name: 'password_token', nullable: true })
  password_token: string;

  @Column({ default: false })
  is_password_reset: boolean;

  @OneToOne(() => UserAuth, (userAuth) => userAuth.user_token, { onDelete: 'CASCADE' })
  user_auth: UserAuth;
}
