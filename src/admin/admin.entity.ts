import { AfterUpdate, Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  @Generated('uuid')
  admin_id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ default: 0 })
  refresh_version: number;

  // TODO Log Refresh Token
  @AfterUpdate()
  logRefresh() {}
}
