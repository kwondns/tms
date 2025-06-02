import { AfterUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'drive' })
export class Agreement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  service_agreement: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  service_agreement_updated_at: Date;

  @AfterUpdate()
  updateServiceAgreementUpdatedAt() {
    this.service_agreement_updated_at = new Date();
  }

  @Column()
  user_agreement: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  user_agreement_updated_at: Date;

  @AfterUpdate()
  updateUserAgreementUpdatedAt() {
    this.user_agreement_updated_at = new Date();
  }
}
