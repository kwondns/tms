import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectDetail } from '../entities/projectDetail.entity';
import { ProjectDto } from '../dtos/project.dto';
import { BackTag, FrontTag } from '../entities/projectTag.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectDetail) private projectDetailRepo: Repository<ProjectDetail>,
    @InjectRepository(FrontTag) private frontTagRepo: Repository<FrontTag>,
    @InjectRepository(BackTag) private backTagRepo: Repository<BackTag>,
  ) {}

  async getProjectAll() {
    const result = await this.projectRepo.find({
      where: { visible: true },
      order: { created_at: 'asc' },
      relations: ['front_tag', 'back_tag'],
    });
    if (result.length === 0) throw new BadRequestException('잘못된 요청입니다.');
    return result;
  }

  async getProjectById(id: string) {
    const result = await this.projectRepo.findOne({
      where: { id },
      relations: ['projectDetail', 'back_tag', 'front_tag'],
    });
    if (!result) throw new BadRequestException('잘못된 요청입니다.');
    return result;
  }

  async updateProject(id: string, projectAttrs: ProjectDto) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['projectDetail', 'back_tag', 'front_tag'],
    });
    if (!project.projectDetail) throw new BadRequestException('잘못된 요청입니다.');
    const { projectDetail, front_tag, back_tag, ...others } = projectAttrs;
    const front = front_tag.map((tag) => this.frontTagRepo.create({ front_tag: tag }));
    const back = back_tag.map((tag) => this.backTagRepo.create({ back_tag: tag }));
    project.projectDetail.content = projectDetail;
    project.front_tag = front;
    project.back_tag = back;
    Object.assign(project, others);
    return await this.projectRepo.save(project);
  }

  async createProject(projectAttrs: ProjectDto) {
    const { projectDetail, front_tag, back_tag, ...others } = projectAttrs;
    const projectDetailObject = this.projectDetailRepo.create({ content: projectDetail });
    const front = front_tag.map((tag) => this.frontTagRepo.create({ front_tag: tag }));
    const back = back_tag.map((tag) => this.backTagRepo.create({ back_tag: tag }));
    const project = this.projectRepo.create(others);
    project.projectDetail = projectDetailObject;
    project.front_tag = front;
    project.back_tag = back;
    return this.projectRepo.save(project);
  }
}
