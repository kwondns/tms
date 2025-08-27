import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';

@Entity('archive', { schema: 'myleisure' })
export class Archive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leisure_id: number;

  @Column()
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Leisure, (leisure) => leisure.archive, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leisure_id' })
  leisure: Leisure;

  @ManyToOne(() => UserAuth, (userAuth) => userAuth.archive, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_auth?: UserAuth;
}
