import { Module } from '@nestjs/common';
import { PastService } from './past/past.service';
import { PresentService } from './present/present.service';
import { FutureService } from './future/future.service';
import { PresentController } from './present/present.controller';
import { PastController } from './past/past.controller';
import { FutureController } from './future/future.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Past } from './entities/past.entity';
import { PastCount, PastCountView } from './entities/pastCount.entity';
import { Present } from './entities/present.entity';
import { Future } from './entities/future.entity';
import { FutureBox } from './entities/futureBox.entity';
import { UploadService } from '../upload/upload.service';
import { PresentGateway } from './events/present.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Past, PastCount, Present, Future, FutureBox, PastCountView])],
  controllers: [PresentController, PastController, FutureController],
  providers: [PresentGateway, PastService, PresentService, FutureService, UploadService],
})
export class TimeModule {}
