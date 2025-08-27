import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';

@Entity('leisure_image', { schema: 'myleisure' })
export class LeisureImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leisure_id: number;

  @Column({ type: 'text' })
  image: string;

  @ManyToOne(() => Leisure, (leisure) => leisure.leisure_image, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leisure_id' })
  leisure: Leisure;
}
