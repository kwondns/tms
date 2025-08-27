import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('search_trend', { schema: 'myleisure' })
@Unique(['age', 'gender'])
export class SearchTrend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  gender?: number;

  @Column({ type: 'varchar', length: 255 })
  leisure_1_category: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_1_id: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_2_category: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_2_id: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_3_category: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_3_id: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_4_category: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_4_id: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_5_category: string;

  @Column({ type: 'varchar', length: 255 })
  leisure_5_id: string;
}
