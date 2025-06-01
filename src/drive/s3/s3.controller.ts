import { Body, Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { S3Service } from '@/drive/s3/s3.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class S3Controller {
  constructor(private readonly uploadService: S3Service) {}
  @Post(':target')
  @UseInterceptors(AnyFilesInterceptor())
  uploadToS3(
    @Param('target') target: string,
    @Body() body: { num: string; uri?: string },
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const fixedFiles = files.map((file) => ({
      ...file,
      originalname: Buffer.from(file.originalname, 'latin1').toString('utf8'),
    }));
    return this.uploadService.uploadHandler(target, fixedFiles, body.uri);
  }

  // @Delete(':target')
  // @UseInterceptors(AnyFilesInterceptor())
  // deleteFromS3(@Param('target') type: string, @Body() body: { target: string }) {
  //   return this.uploadService.deleteHandler(type, body.target);
  // }
}
