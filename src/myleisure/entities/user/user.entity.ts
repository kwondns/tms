import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';

@Entity('user', { schema: 'myleisure' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ nullable: true })
  gender?: number;

  @Column({ nullable: true })
  age?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mail_address?: string;

  @Column({ default: false })
  isinitialized?: boolean;

  @OneToOne(() => UserAuth, (userAuth) => userAuth.user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user_auth: UserAuth;
}
