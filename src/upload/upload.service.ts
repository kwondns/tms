import { Injectable } from '@nestjs/common';
import { DeleteObjectsCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadService {
  s3: S3Client;
  bucket: string;
  putPromises: any[];
  putResults: string[];
  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS'),
        secretAccessKey: this.configService.get<string>('S3_SECRET'),
      },
    });
    this.bucket = `${this.configService.get<string>('S3_BUCKET')}`;
    this.putPromises = [];
    this.putResults = [];
  }
  async uploadHandler(path: string, files: Array<Express.Multer.File>, num: number, uri?: string) {
    const env = this.configService.get<string>('S3_ENV');
    if (this.putResults.length >= num) this.putResults = [];
    this.putPromises = [];
    for (const file of files) {
      await this.putS3(path, env, file, uri);
    }
    await Promise.all(this.putPromises);
    return this.putResults;
  }

  genRanHex() {
    return randomBytes(8).toString('hex');
  }

  async putS3(path: string, env: string, file: Express.Multer.File, uri?: string) {
    const fileExtension = file.originalname.split('.').pop();
    const today = new Date().toLocaleDateString('ko-KR').slice(0, -1).replaceAll('.', '-').replaceAll(' ', '');
    const filePath = `${env}${uri ?? ''}${today}/${this.genRanHex()}.${fileExtension && fileExtension.toLowerCase()}`;
    this.putResults.push(filePath);
    const ContentDisposition = `attachment; filename*=UTF-8"${encodeURIComponent(file.originalname)}"`;
    const command = new PutObjectCommand({
      Bucket: `${this.bucket}-${path}`,
      Key: filePath,
      Body: file.buffer,
      ACL: 'public-read',
      ContentDisposition,
    });
    this.putPromises.push(this.s3.send(command));
  }

  async deleteHandler(type: string, path: string | string[]) {
    const target = [];
    const makeTarget = (path: string) => target.push({ Key: path });
    if (path instanceof Array) {
      path.forEach((key) => makeTarget(key));
    } else makeTarget(path);
    const command = new DeleteObjectsCommand({
      Bucket: `${this.bucket}-${type}`,
      Delete: { Objects: target },
    });
    return this.s3.send(command);
  }

  async objectList(type: string, path: string) {
    const Obj = new ListObjectsCommand({ Bucket: `${this.bucket}-${type}`, Prefix: path });
    return await this.s3.send(Obj);
  }
}
