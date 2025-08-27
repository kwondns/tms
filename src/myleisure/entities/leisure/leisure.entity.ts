import { Column, CreateDateColumn, Entity, Index, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { LeisureImage } from '@/myleisure/entities/leisure/leisureImage.entity';
import { Archive } from '@/myleisure/entities/user/archive.entity';
import { DefaultLeisure } from '@/myleisure/entities/leisure/defualtLeisure.entity';

@Entity('leisure', { schema: 'myleisure' })
@Index(['business_name', 'business_address'])
@Index(['business_name'])
@Index(['business_address'])
export class Leisure {
  @PrimaryColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  business_name: string;

  @Column({ type: 'varchar', length: 255 })
  business_address: string;

  @Column({ nullable: true })
  visitor_review_count?: number;

  @Column({ nullable: true })
  blog_review_count?: number;

  @Column({ type: 'text', nullable: true })
  business_photo?: string;

  @Column({ type: 'text', nullable: true })
  lng?: string;

  @Column({ type: 'text', nullable: true })
  lat?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Archive, (archive) => archive.leisure)
  archive: Archive[];

  @OneToMany(() => LeisureImage, (leisureImage) => leisureImage.leisure)
  leisure_image: LeisureImage[];

  @OneToOne(() => DefaultLeisure, (default_leisure) => default_leisure.leisure)
  default_leisure?: DefaultLeisure;
}
