import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ schema: 'portfolio' })
export class ProjectDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Project, (project) => project.projectDetail)
  project: Project;

  @Column()
  content: string;
}
