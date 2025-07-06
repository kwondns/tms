import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '@/port/entities/project.entity';

@Entity({ schema: 'portfolio' })
export class ProjectDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Project, (project) => project.projectDetail)
  project: Project;

  @Column({ nullable: false, default: '-' })
  link: string;

  @Column({ nullable: false, default: '' })
  context: string;

  @Column({ nullable: false, default: '' })
  role: string;

  @Column({ type: 'text', array: true, default: [] })
  images: string[];
}
