import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '@/port/entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectMoreDetail } from '@/port/entities/projectMoreDetail.entity';
import { ProjectDto, ProjectUpdateDto } from '@/port/dtos/project.dto';
import { BackTag, FrontTag } from '@/port/entities/projectTag.entity';
import { ProjectDetail } from '@/port/entities/projectDetail.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectDetail) private projectDetailRepo: Repository<ProjectDetail>,
    @InjectRepository(ProjectMoreDetail) private projectMoreDetailRepo: Repository<ProjectMoreDetail>,
    @InjectRepository(FrontTag) private frontTagRepo: Repository<FrontTag>,
    @InjectRepository(BackTag) private backTagRepo: Repository<BackTag>,
  ) {}

  async getProjectAll() {
    const result = await this.projectRepo.find({
      where: { visible: true },
      order: { created_at: 'desc' },
      relations: ['front_tag', 'back_tag', 'projectDetail'],
    });
    if (result.length === 0) throw new BadRequestException('잘못된 요청입니다.');
    return result;
  }

  async getProjectAllVisible() {
    const result = await this.projectRepo.find({
      order: { created_at: 'desc' },
      relations: ['front_tag', 'back_tag'],
    });
    if (result.length === 0) throw new BadRequestException('잘못된 요청입니다.');
    return result;
  }

  async getProjectDetailById(id: string) {
    const result = await this.projectRepo.findOne({
      where: { id },
      relations: ['projectDetail', 'back_tag', 'front_tag', 'project_modal_data'],
    });
    if (!result) throw new BadRequestException('잘못된 요청입니다.');
    return result;
  }

  async getProjectMoreDetailById(id: string) {
    const result = await this.projectRepo.findOne({
      where: { id },
      relations: ['projectDetail', 'projectMoreDetail', 'back_tag', 'front_tag'],
    });
    if (!result) throw new BadRequestException('잘못된 요청입니다.');
    return result;
  }

  async updateProject(id: string, projectAttrs: ProjectUpdateDto) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['projectDetail', 'projectMoreDetail', 'back_tag', 'front_tag'],
    });
    if (!project.projectMoreDetail) throw new BadRequestException('잘못된 요청입니다.');
    const { projectMoreDetail, context, link, role, images, front_tag, back_tag, ...others } = projectAttrs;
    const front = front_tag.map((tag) => this.frontTagRepo.create({ front_tag: tag }));
    const back = back_tag.map((tag) => this.backTagRepo.create({ back_tag: tag }));
    project.projectMoreDetail.content = projectMoreDetail;
    project.projectDetail.link = link;
    project.projectDetail.images = images;
    project.projectDetail.context = context;
    project.projectDetail.role = role;
    project.front_tag = front;
    project.back_tag = back;
    await this.frontTagRepo.createQueryBuilder().delete().from(FrontTag).where('projectId is NULL').execute();
    await this.backTagRepo.createQueryBuilder().delete().from(BackTag).where('projectId is NULL').execute();
    Object.assign(project, others);
    return await this.projectRepo.save(project);
  }

  async createProject(projectAttrs: ProjectDto) {
    const { projectMoreDetail, context, role, link, images, front_tag, back_tag, ...others } = projectAttrs;
    const projectMoreDetailObject = this.projectMoreDetailRepo.create({ content: projectMoreDetail });
    const projectDetailObject = this.projectDetailRepo.create({ context, images, role, link });
    const front = front_tag.map((tag) => this.frontTagRepo.create({ front_tag: tag }));
    const back = back_tag.map((tag) => this.backTagRepo.create({ back_tag: tag }));
    const project = this.projectRepo.create(others);
    project.projectDetail = projectDetailObject;
    project.projectMoreDetail = projectMoreDetailObject;
    project.front_tag = front;
    project.back_tag = back;
    return this.projectRepo.save(project);
  }
}
