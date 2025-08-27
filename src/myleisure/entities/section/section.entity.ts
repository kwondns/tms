import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('section1', { schema: 'myleisure' })
export class Section1 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'text', nullable: true })
  columns?: string;

  @Column({ type: 'text', nullable: true })
  features?: string;

  @Column({ type: 'text' })
  leisure_id: string;
}

@Entity('section2', { schema: 'myleisure' })
export class Section2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'text', nullable: true })
  columns?: string;

  @Column({ type: 'text', nullable: true })
  features?: string;

  @Column({ type: 'text' })
  leisure_id: string;
}

@Entity('section3', { schema: 'myleisure' })
export class Section3 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  leisure_id: string;
}

@Entity('section4', { schema: 'myleisure' })
export class Section4 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  leisure_id: string;
}

@Entity('leisure_feature', { schema: 'myleisure' })
export class LeisureFeature {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  column: string;

  @Column({ type: 'varchar', length: 255 })
  feature: string;
}

@Entity('section_title', { schema: 'myleisure' })
export class SectionTitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  section1?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  section2?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  section3?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  section4?: string;
}
