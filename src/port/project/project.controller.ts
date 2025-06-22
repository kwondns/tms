import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Public } from '@/decorators/public.decorator';
import { ProjectDto, ProjectUpdateDto } from '../dtos/project.dto';
import { ProjectService } from './project.service';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { ResponseProjectDto } from '../dtos/responseProject.dto';

@Serialize(ResponseProjectDto)
@Controller('/port/project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Public()
  @Get()
  async getProjectAll() {
    return this.projectService.getProjectAll();
  }

  @Public()
  @Get('visible')
  async getProjectAllVisible() {
    return this.projectService.getProjectAllVisible();
  }

  @Public()
  @Get(':id')
  async getProjectDetailById(@Param('id') id: string) {
    return this.projectService.getProjectDetailById(id);
  }

  @Public()
  @Get('/more/:id')
  async getProjectMoreDetailById(@Param('id') id: string) {
    return this.projectService.getProjectMoreDetailById(id);
  }

  @Put(':id')
  async updateProjectById(@Param('id') id: string, @Body() body: ProjectUpdateDto) {
    return this.projectService.updateProject(id, body);
  }

  @Post()
  createProject(@Body() body: ProjectDto) {
    return this.projectService.createProject(body);
  }
}
