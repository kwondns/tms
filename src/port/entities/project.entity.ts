import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BackTag, FrontTag } from '@/port/entities/projectTag.entity';
import { ProjectMoreDetail } from '@/port/entities/projectMoreDetail.entity';
import { ProjectDetail } from '@/port/entities/projectDetail.entity';
import { ProjectModalData } from '@/port/entities/projectModalData.entity';

@Entity({ schema: 'portfolio' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  shorten_content: string;

  @Column()
  preview_image: string;

  @Column()
  date: string;

  @Column()
  db: string;

  @Column()
  visible: boolean;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: string;

  @OneToMany(() => FrontTag, (frontTag) => frontTag.project, { cascade: true })
  front_tag: FrontTag[];

  @OneToMany(() => BackTag, (backTag) => backTag.project, { cascade: true })
  back_tag: BackTag[];

  @OneToOne(() => ProjectDetail, (projectDetail) => projectDetail.project, { cascade: true })
  @JoinColumn()
  projectDetail: ProjectDetail;

  @OneToOne(() => ProjectMoreDetail, (projectMoreDetail) => projectMoreDetail.project, { cascade: true })
  @JoinColumn()
  projectMoreDetail: ProjectMoreDetail;

  @OneToOne(() => ProjectModalData, (projectModalData) => projectModalData.project, { cascade: true })
  @JoinColumn()
  project_modal_data: ProjectModalData;
}
