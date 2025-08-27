import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { Archive } from '@/myleisure/entities/user/archive.entity';
import { User } from '@/myleisure/entities/user/user.entity';
import { UserAgreement } from '@/myleisure/entities/user/userAgreement.entity';
import { UserAlarm } from '@/myleisure/entities/user/userAlarm.entity';
import { UserToken } from '@/myleisure/entities/user/userToken.entity';

@Entity('user_auth', { schema: 'myleisure' })
export class UserAuth {
  @PrimaryColumn({ type: 'varchar', length: 43 })
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

  @OneToMany(() => Archive, (archive) => archive.user_auth)
  archive: Archive[];

  @Column({ type: 'int', default: 0 })
  status: number;

  @OneToOne(() => User, (user) => user.user_auth)
  user?: User;

  @OneToOne(() => UserAgreement, (userAgreement) => userAgreement.user_auth)
  user_agreement?: UserAgreement;

  @OneToMany(() => UserAlarm, (userAlarm) => userAlarm.user_auth)
  user_alarm: UserAlarm[];

  @OneToOne(() => UserToken, (userToken) => userToken.user_auth, { onDelete: 'CASCADE' })
  @JoinColumn()
  user_token: UserToken;
}
