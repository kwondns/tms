import { Module } from '@nestjs/common';
import { NoticeController } from '@/drive/notice/notice.controller';
import { NoticeService } from '@/drive/notice/notice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from '@/drive/notice/notice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
