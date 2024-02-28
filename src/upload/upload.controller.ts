import { Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}
  @Post(':target')
  @UseInterceptors(AnyFilesInterceptor())
  uploadToS3(@Param('target') target: string, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.uploadService.uploadHandler(target, files);
  }
}
