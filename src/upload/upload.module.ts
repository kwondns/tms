import { Module } from '@nestjs/common';
import { UploadService } from '@/upload/upload.service';
import { UploadController } from '@/upload/upload.controller';

@Module({
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
