import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at: Date;

  get expired_at(): Date {
    return new Date(this.created_at.getTime() + 3 * 60 * 1000);
  }

  @Column()
  code: number;

  @BeforeInsert()
  generateVerificationCode() {
    this.code = Math.floor(100000 + Math.random() * 900000);
  }

  @Column({ default: false })
  is_verified: boolean;
}
