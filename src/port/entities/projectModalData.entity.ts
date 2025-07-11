import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '@/port/entities/project.entity';

@Entity({ schema: 'portfolio' })
export class ProjectModalData {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Project, (project) => project.project_modal_data)
  project: Project;

  @Column()
  content: string;

  @Column()
  modal_role: string;
}
