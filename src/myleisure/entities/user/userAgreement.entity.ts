import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';

@Entity('user_agreement', { schema: 'myleisure' })
export class UserAgreement {
  @PrimaryColumn({ type: 'varchar', length: 43 })
  user_id: string;

  @Column({ default: false })
  myleisureagreed?: boolean;

  @Column({ default: false })
  personalinfoagreed?: boolean;

  @Column({ default: false })
  marketingagreed?: boolean;

  @Column({ nullable: true })
  kakaomarketingagreed?: boolean;

  @Column({ nullable: true })
  emailmarketingagreed?: boolean;

  @Column({ nullable: true })
  pushmarketingagreed?: boolean;

  @Column({ default: false })
  locationagreed?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  myleisureagreed_at?: Date;

  @OneToOne(() => UserAuth, (userAuth) => userAuth.user_agreement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_auth: UserAuth;
}
