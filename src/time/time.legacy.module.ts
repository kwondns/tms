import { Module } from '@nestjs/common';
import { PastLegacyService } from '@/time/past/legacy/past.legacy.service';
import { PresentLegacyService } from '@/time/present/legacy/present.legacy.service';
import { FutureLegacyService } from '@/time/future/legacy/future.legacy.service';
import { PresentLegacyController } from '@/time/present/legacy/present.legacy.controller';
import { PastLegacyController } from '@/time/past/legacy/past.legacy.controller';
import { FutureLegacyController } from '@/time/future/legacy/future.legacy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Past } from '@/time/entities/legacy/past.legacy.entity';
import { PastCount, PastCountView } from '@/time/entities/legacy/pastCount.legacy.entity';
import { Present } from '@/time/entities/legacy/present.legacy.entity';
import { Future } from '@/time/entities/legacy/future.legacy.entity';
import { FutureBox } from '@/time/entities/legacy/futureBox.legacy.entity';
import { UploadService } from '@/upload/upload.service';
import { PresentLegacyGateway } from '@/time/events/legacy/present.legacy.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Past, PastCount, Present, Future, FutureBox, PastCountView])],
  controllers: [PresentLegacyController, PastLegacyController, FutureLegacyController],
  providers: [PresentLegacyGateway, PastLegacyService, PresentLegacyService, FutureLegacyService, UploadService],
})
export class TimeLegacyModule {}
