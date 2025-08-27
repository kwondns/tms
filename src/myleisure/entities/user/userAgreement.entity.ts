import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';

@Entity('user_agreement', { schema: 'myleisure' })
export class UserAgreement {
  @PrimaryColumn()
  user_id: string;

  @Column({ default: false })
  myLeisureAgreed?: boolean;

  @Column({ default: false })
  personalInfoAgreed?: boolean;

  @Column({ default: false })
  marketingAgreed?: boolean;

  @Column({ nullable: true })
  kakaoMarketingAgreed?: boolean;

  @Column({ nullable: true })
  emailMarketingAgreed?: boolean;

  @Column({ nullable: true })
  pushMarketingAgreed?: boolean;

  @Column({ default: false })
  locationAgreed?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  myleisureagreed_at?: Date;

  @OneToOne(() => UserAuth, (userAuth) => userAuth.user_agreement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_auth: UserAuth;
}
