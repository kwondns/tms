import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Archive } from '@/myleisure/entities/user/archive.entity';
import { User } from '@/myleisure/entities/user/user.entity';
import { UserAgreement } from '@/myleisure/entities/user/userAgreement.entity';
import { UserAlarm } from '@/myleisure/entities/user/userAlarm.entity';
import { UserToken } from '@/myleisure/entities/user/userToken.entity';

@Entity('user_auth', { schema: 'myleisure' })
export class UserAuth {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mail_address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'int', default: 0 })
  social?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  withdraw_survey?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @Column({ type: 'int', default: 0 })
  status: number;

  @OneToMany(() => Archive, (archive) => archive.user_auth)
  archive: Archive[];

  @OneToOne(() => User, (user) => user.user_auth, { cascade: true, onDelete: 'CASCADE' })
  user?: User;

  @OneToOne(() => UserAgreement, (userAgreement) => userAgreement.user_auth, { cascade: true, onDelete: 'CASCADE' })
  user_agreement?: UserAgreement;

  @OneToMany(() => UserAlarm, (userAlarm) => userAlarm.user_auth, { cascade: true, onDelete: 'CASCADE' })
  user_alarm: UserAlarm[];

  @OneToOne(() => UserToken, (userToken) => userToken.user_auth, { onDelete: 'CASCADE' })
  user_token: UserToken;
}
