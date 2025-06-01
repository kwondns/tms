import { CallHandler, ExecutionContext, Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

export function KoreanFilesInterceptor(fieldName: string, maxCount?: number): Type<NestInterceptor> {
  const Interceptor = FilesInterceptor(fieldName, maxCount, {
    storage: diskStorage({
      filename: (_, file, callback) => {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const normalizedName = decodedName.normalize('NFC');
        const timestamp = Date.now();
        const ext = path.extname(normalizedName);
        const baseName = path.basename(normalizedName, ext);
        callback(null, `${baseName}_${timestamp}${ext}`);
      },
    }),
    fileFilter: (_, file, cb) => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      cb(null, true);
    },
  });

  @Injectable()
  class MixinInterceptor extends Interceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler) {
      return super.intercept(context, next);
    }
  }

  return mixin(MixinInterceptor);
}
