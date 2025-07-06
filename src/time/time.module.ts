import { Module } from '@nestjs/common';
import { PastService } from '@/time/past/past.service';
import { PresentService } from '@/time/present/present.service';
import { FutureService } from '@/time/future/future.service';
import { PresentController } from '@/time/present/present.controller';
import { PastController } from '@/time/past/past.controller';
import { FutureController } from '@/time/future/future.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Past } from '@/time/entities/past.entity';
import { PastCount, PastCountView } from '@/time/entities/pastCount.entity';
import { Present } from '@/time/entities/present.entity';
import { Future } from '@/time/entities/future.entity';
import { FutureBox } from '@/time/entities/futureBox.entity';
import { UploadService } from '@/upload/upload.service';
import { PresentGateway } from '@/time/events/present.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Past, PastCount, Present, Future, FutureBox, PastCountView])],
  controllers: [PresentController, PastController, FutureController],
  providers: [PresentGateway, PastService, PresentService, FutureService, UploadService],
})
export class TimeModule {}
