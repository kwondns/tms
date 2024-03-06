import { Body, Controller, Delete, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}
  @Post(':target')
  @UseInterceptors(AnyFilesInterceptor())
  uploadToS3(
    @Param('target') target: string,
    @Body() body: { uri?: string },
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.uploadService.uploadHandler(target, files, body.uri);
  }

  @Delete(':target')
  @UseInterceptors(AnyFilesInterceptor())
  deleteFromS3(@Param('target') type: string, @Body() body: { target: string }) {
    return this.uploadService.deleteHandler(type, body.target);
  }
}
