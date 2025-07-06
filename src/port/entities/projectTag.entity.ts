import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '@/port/entities/project.entity';

export abstract class ProjectTag {
  @PrimaryGeneratedColumn()
  id: string;
}

@Entity({ schema: 'portfolio' })
export class FrontTag extends ProjectTag {
  @Column()
  front_tag: string;

  @ManyToOne(() => Project, (project) => project.front_tag)
  project: Project;
}
@Entity({ schema: 'portfolio' })
export class BackTag extends ProjectTag {
  @Column()
  back_tag: string;

  @ManyToOne(() => Project, (project) => project.back_tag)
  project: Project;
}
