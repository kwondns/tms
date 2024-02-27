import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { BackTag, FrontTag, ProjectTag } from './entities/projectTag.entity';
import {
  BackStack as Backstack,
  BackStackByCategory,
  EtcStack,
  EtcStackByCategory,
  FrontStack,
  FrontStackByCategory,
} from './entities/stack.entity';
import { StackController } from './stack/stack.controller';
import { StackService } from './stack/stack.service';
import { ProjectController } from './project/project.controller';
import { ProjectService } from './project/project.service';
import { ProjectDetail } from './entities/projectDetail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectTag,
      ProjectDetail,
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
