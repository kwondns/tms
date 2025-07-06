import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@/port/entities/project.entity';
import { BackTag, FrontTag, ProjectTag } from '@/port/entities/projectTag.entity';
import {
  BackStack as Backstack,
  BackStackByCategory,
  EtcStack,
  EtcStackByCategory,
  FrontStack,
  FrontStackByCategory,
} from '@/port/entities/stack.entity';
import { StackController } from '@/port/stack/stack.controller';
import { StackService } from '@/port/stack/stack.service';
import { ProjectController } from '@/port/project/project.controller';
import { ProjectService } from '@/port/project/project.service';
import { ProjectMoreDetail } from '@/port/entities/projectMoreDetail.entity';
import { ProjectDetail } from '@/port/entities/projectDetail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectTag,
      ProjectDetail,
      ProjectMoreDetail,
      FrontTag,
      BackTag,
      Backstack,
      BackStackByCategory,
      FrontStack,
      FrontStackByCategory,
      EtcStack,
      EtcStackByCategory,
    ]),
  ],
  controllers: [StackController, ProjectController],
  providers: [ProjectService, StackService],
})
export class PortModule {}
