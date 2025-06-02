import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'drive' })
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password_reset_token: string;

  @Column({
    nullable: true,
    type: 'timestamp with time zone',
  })
  password_reset_token_expires_at: Date;
}
