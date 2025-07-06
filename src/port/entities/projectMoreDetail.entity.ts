import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '@/port/entities/project.entity';

@Entity({ schema: 'portfolio' })
export class ProjectMoreDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Project, (project) => project.projectMoreDetail)
  project: Project;

  @Column()
  content: string;
}
