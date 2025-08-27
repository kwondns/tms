import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';

@Entity({ schema: 'myleisure' })
@TableInheritance({ column: { type: 'varchar', name: 'leisure' } })
export class DefaultLeisure {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'text', nullable: true })
  oneline_introduction?: string;

  @Column({ type: 'text', nullable: true })
  business_contact?: string;

  @Column({ type: 'text', nullable: true })
  activity_type?: string;

  @Column({ type: 'text', nullable: true })
  surrounding_scenery?: string;

  @Column({ type: 'text', nullable: true })
  flight_time?: string;

  @Column({ type: 'text', nullable: true })
  every_day?: string;

  @Column({ type: 'text', nullable: true })
  weekdays?: string;

  @Column({ type: 'text', nullable: true })
  weekends?: string;

  @Column({ type: 'text', nullable: true })
  monday?: string;

  @Column({ type: 'text', nullable: true })
  tuesday?: string;

  @Column({ type: 'text', nullable: true })
  wednesday?: string;

  @Column({ type: 'text', nullable: true })
  thursday?: string;

  @Column({ type: 'text', nullable: true })
  friday?: string;

  @Column({ type: 'text', nullable: true })
  saturday?: string;

  @Column({ type: 'text', nullable: true })
  sunday?: string;

  @Column({ type: 'text', nullable: true })
  public_holidays?: string;

  @Column({ type: 'text', nullable: true })
  holidays?: string;

  @Column({ type: 'text', nullable: true })
  facility_information?: string;

  @Column({ type: 'text', nullable: true })
  service_information?: string;

  @Column({ type: 'text', nullable: true })
  business_introduction?: string;

  @Column({ type: 'text', nullable: true })
  usage_fee?: string;

  @Column({ type: 'text', nullable: true })
  reservation_guide?: string;

  @Column({ type: 'text', nullable: true })
  paid_operating_programs?: string;

  @Column({ type: 'text', nullable: true })
  free_operating_programs?: string;

  @Column({ type: 'text', nullable: true })
  paid_additional_services?: string;

  @Column({ type: 'text', nullable: true })
  free_additional_services?: string;

  @Column({ type: 'text', nullable: true })
  events?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  naver_place_url?: string;

  @Column({ type: 'text', nullable: true })
  visitor_review_url?: string;

  @Column({ type: 'text', nullable: true })
  blog_review_url?: string;

  @Column({ type: 'text', nullable: true })
  naver_reservation_url?: string;

  @Column({ type: 'text', nullable: true })
  sns_homepage?: string;

  @Column({ type: 'text', nullable: true })
  sns_instagram?: string;

  @Column({ type: 'text', nullable: true })
  sns_facebook?: string;

  @Column({ type: 'text', nullable: true })
  sns_youtube?: string;

  @Column({ type: 'text', nullable: true })
  sns_blog?: string;

  @Column({ type: 'text', nullable: true })
  sns_cafe?: string;

  @Column({ type: 'text', nullable: true })
  sns_smartstore?: string;

  @Column({ type: 'text', nullable: true })
  climbing_difficulty_level?: string;

  @Column({ type: 'text', nullable: true })
  parking_guide?: string;

  @Column({ type: 'text', nullable: true })
  sns_daum?: string;

  @Column({ type: 'text', nullable: true })
  sns_kakao?: string;

  @Column({ type: 'text', nullable: true })
  skill_level?: string;

  @Column({ type: 'text', nullable: true })
  accommodation_operations?: string;

  @Column({ type: 'text', nullable: true })
  snow_maintenance_time?: string;

  @Column({ type: 'text', nullable: true })
  parking_information?: string;

  @Column({ type: 'text', nullable: true })
  natural_scenery?: string;

  @Column({ type: 'text', nullable: true })
  nearby_ski_resort?: string;

  @Column({ type: 'text', nullable: true })
  lesson_information?: string;

  @Column({ type: 'text', nullable: true })
  pickup_information?: string;

  @Column({ type: 'text', nullable: true })
  nearby_beach?: string;

  @Column({ type: 'text', nullable: true })
  break_time?: string;

  @Column({ type: 'text', nullable: true })
  sns_etc1?: string;

  @Column({ type: 'text', nullable: true })
  sns_etc2?: string;

  @Column({ type: 'text', nullable: true })
  surrounding_environment?: string;

  @Column({ type: 'text', nullable: true })
  floor_type?: string;

  @Column({ type: 'text', nullable: true })
  attractions?: string;

  @Column({ type: 'text', nullable: true })
  maintenance_time?: string;

  @Column({ type: 'text', nullable: true })
  quiet_time?: string;

  @Column({ type: 'text', nullable: true })
  nearby_attractions?: string;

  @OneToOne(() => Leisure, (leisure) => leisure.default_leisure, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  leisure: Leisure;
}
