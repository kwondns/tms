import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('survey', { schema: 'myleisure' })
export class Survey {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  survey1: string;

  @Column({ type: 'text' })
  survey2: string;

  @Column({ type: 'text' })
  survey3: string;

  @Column({ type: 'text' })
  survey4: string;

  @Column({ type: 'text' })
  survey5: string;

  @Column({ type: 'text' })
  survey6: string;

  @Column({ type: 'text' })
  survey7: string;

  @Column({ type: 'text' })
  survey8: string;

  @CreateDateColumn()
  created_at: Date;
}
