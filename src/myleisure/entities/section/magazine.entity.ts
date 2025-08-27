import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('home_magazine', { schema: 'myleisure' })
export class HomeMagazine {
  @PrimaryGeneratedColumn()
  magazine_id: number;

  @Column({ type: 'varchar', length: 255 })
  img_source: string;

  @Column({ type: 'varchar', length: 255 })
  img_vertical: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link?: string;

  @Column({ type: 'timestamp' })
  expired_at: Date;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column()
  visible: boolean;
}
