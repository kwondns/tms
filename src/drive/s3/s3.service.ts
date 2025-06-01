import { Inject, Injectable } from '@nestjs/common';
import { DeleteObjectsCommand, DeleteObjectsCommandInput, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigType } from '@nestjs/config';
import { randomBytes } from 'crypto';
import mime from 'mime-types';
import AppConfig from '@/app.config';
import sanitize from 'sanitize-filename';
import { Upload } from '@aws-sdk/lib-storage';
import * as _ from 'lodash';
import path from 'path';
import { UploadResultType } from '@/drive/s3/s3.type';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { File } from '@/drive/drive/entities/file.entity';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class S3Service {
  s3: S3Client;
  constructor(@Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>) {
    // S3 기본 연결 설정
    this.s3 = new S3Client({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.config.s3.s3Access,
        secretAccessKey: this.config.s3.s3Secret,
      },
    });
  }

  // 파일 업로드 목록 Promise 배열화 및 실행
  async uploadHandler(bucket: string, files: Array<Express.Multer.File>, uri?: string): Promise<UploadResultType> {
    const env = this.config.s3.s3Env;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const uploadPromises = files.map((file, index) =>
      this.putS3(bucket, file, `${env}/${uri ?? ''}${today}`)
        .then((result) => ({ index, result }))
        .catch((error) => ({ index, result: error })),
    );
    const results = await Promise.allSettled(uploadPromises);

    return files.map((file, originalIndex) => {
      const settled = results.find((res) => res.status === 'fulfilled' && res.value.index === originalIndex);
      return settled.status === 'fulfilled'
        ? {
            success: true,
            originalName: file.originalname,
            ...settled.value.result,
          }
        : {
            success: false,
            originalName: file.originalname,
            error: settled?.reason?.result ?? 'error',
          };
    });
  }

  // 랜덤 핵스값 생성 후 파일명에 지정
  genRanHex() {
    return randomBytes(8).toString('hex');
  }

  preProcessFileInfo = (file: Express.Multer.File) => {
    mime.types['hwp'] = 'application/x-hwp';
    mime.extensions['application/x-hwp'] = ['hwp'];
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const fileName = sanitize(baseName).replace(/\s+/g, '_').toLowerCase();
    const fileExt: string = mime.extension(file.mimetype) || 'bin';
    const ContentType: string = mime.lookup(fileExt) || 'application/octet-stream';
    return { fileName, fileExt, ContentType };
  };

  // S3에 파일 업로드 수행
  async putS3(bucket: string, file: Express.Multer.File, uri: string) {
    const { fileName, fileExt, ContentType } = this.preProcessFileInfo(file);
    const filePath = `${uri}/${this.genRanHex()}_${fileName}.${fileExt}`;
    const isImage = ContentType.startsWith('image/');
    const ContentDisposition = isImage
      ? `inline; filename*=UTF-8"${encodeURIComponent(fileName)}"`
      : `attachment; filename*=UTF-8"${encodeURIComponent(fileName)}"`;
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: bucket,
        Key: filePath,
        Body: file.buffer,
        ContentType,
        ContentDisposition,
        ACL: 'public-read',
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB
    });

    try {
      await upload.done();
      return { success: true, filePath, size: file.size, originalName: file.originalname };
    } catch (e) {
      await upload.abort();
      throw {
        success: false,
        error: `업로드 실패 ${file.originalname}: ${e.message}`,
        originalName: file.originalname,
      };
    }
  }

  async bulkDelete(bucket: string, paths: string[]) {
    const chunks = _.chunk(paths, 1000);
    for (const chunk of chunks) {
      const params: DeleteObjectsCommandInput = {
        Bucket: bucket,
        Delete: { Objects: chunk.map((path) => ({ Key: path })) },
      };
      try {
        const command = new DeleteObjectsCommand(params);
        const result = await this.s3.send(command);
        if (result.Errors?.length > 0) {
          result.Errors.forEach((error) => {
            console.error(`삭제 실패: ${error.Key} - ${error.Code} (${error.Message})`);
          });
          throw new Error('Partial deletion failure');
        }
        console.log(`성공적으로 ${result.Deleted?.length}개 객체 삭제 완료`);
      } catch (e) {
        console.error(`배치 삭제 실패: ${e.message}`, e.stack);
        throw e;
      }
    }
  }

  async generatePresignedUrl(bucket: string, storage_path: string, filename?: string) {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: storage_path,
      ResponseContentDisposition: `attachment; filename="${filename || 'tms-archive.zip'}"`,
    });
    return await getSignedUrl(this.s3, getCommand, { expiresIn: 3600 });
  }

  async getFileStream(bucket: string, fileSystem: File) {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: fileSystem.storage_path,
    });
    const response = await this.s3.send(getCommand);
    return response.Body as Readable;
  }

  uploadStreamArchiveFile(stream: PassThrough, jobId) {
    return new Upload({
      client: this.s3,
      params: {
        Bucket: this.config.s3.s3TmpArchiveBucket,
        Key: `archives/${new Date().getTime()}_${jobId}.zip`,
        Body: stream,
        ContentType: 'application/zip',
      },
    });
  }
  // 파일 목록
  // async objectList(type: string, path: string) {
  //   const Obj = new ListObjectsCommand({ Bucket: `${this.bucket}-${type}`, Prefix: path });
  //   return await this.s3.send(Obj);
  // }
}
