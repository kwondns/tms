import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('home_banner', { schema: 'myleisure' })
export class HomeBanner {
  @PrimaryGeneratedColumn()
  banner_id: number;

  @Column({ type: 'varchar', length: 255 })
  img_source: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link?: string;

  @Column({ type: 'timestamp' })
  expired_at: Date;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column()
  visible: boolean;
}
