import { Module } from '@nestjs/common';
import { S3Service } from '@/drive/s3/s3.service';
import { S3Controller } from '@/drive/s3/s3.controller';

@Module({
  providers: [S3Service],
  controllers: [S3Controller],
})
export class S3Module {}
