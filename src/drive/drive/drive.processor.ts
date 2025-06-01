import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { File } from '@/drive/drive/entities/file.entity';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { DriveDeleteService } from '@/drive/drive/services/drive.delete.service';
import { S3Service } from '@/drive/s3/s3.service';
import { Counter, Gauge, Registry } from 'prom-client';

@Processor('delete-drive')
export class DriveDeleteProcessor extends WorkerHost {
  constructor(private readonly driveDeleteService: DriveDeleteService) {
    super();
  }

  async process(job: Job<{ fileId: string }>) {
    try {
      const { fileId } = job.data;
      await this.driveDeleteService.s3DeleteTransaction(fileId);
    } catch (error) {
      console.error(`삭제 실패: ${error.message}`);
      throw error;
    }
  }
}
export abstract class DriveDownloadDefaultProcessor<T = any> extends WorkerHost {
  jobCounter: Counter;
  activeJobsGauge: Gauge;

  protected constructor(
    protected readonly driveReadService: DriveReadService,
    protected readonly s3Service: S3Service,
    protected readonly multi: boolean = false,
  ) {
    super();
    const registry = new Registry();
    this.jobCounter = new Counter({
      name: this.multi ? 'multi_download_jobs' : 'download_jobs',
      labelNames: ['status'],
      registers: [registry],
      help: 'Download jobs',
    });
    this.activeJobsGauge = new Gauge({
      name: 'active_jobs',
      help: 'Current active jobs',
      registers: [registry],
    });
  }

  async onModuleInit() {
    this.worker.on('completed', (job) => {
      console.log(`${this.multi ? 'multi ' : ''}Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`${this.multi ? 'multi ' : ''}Job ${job?.id} failed: ${err.message}`);
    });

    this.worker.on('stalled', (jobId) => {
      console.warn(`${this.multi ? 'multi ' : ''}Job ${jobId} stalled`);
    });
  }

  // 템플릿 메서드 패턴의 핵심 메서드
  async process(job: Job<T>): Promise<any> {
    this.activeJobsGauge.inc();

    try {
      // 1. 자식 클래스에서 구현할 파일 목록 획득 단계
      const files = await this.getFiles(job.data);

      // 2. 파일 압축 및 업로드 공통 로직
      const result = await this.compressAndUploadFiles(files, job.id);

      this.jobCounter.inc({ status: 'success' });
      return result;
    } catch (error) {
      this.jobCounter.inc({ status: 'failed' });
      console.error(`압축 및 업로드 중 오류: ${error.message}`);
      throw new Error(`파일 압축 및 업로드 중 오류 발생: ${error.message}`);
    } finally {
      this.activeJobsGauge.dec();
    }
  }

  // 추상 메서드: 자식 클래스에서 반드시 구현해야 함
  protected abstract getFiles(data: T): Promise<File[]>;

  // 공통 로직을 메서드로 추출
  private async compressAndUploadFiles(files: File[], jobId: string): Promise<any> {
    const passThrough = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 4 },
    });

    archive.pipe(passThrough);

    archive.on('error', (err) => {
      throw new Error(`압축 중 오류 발생: ${err.message}`);
    });

    await this.processFiles(files, archive);
    const archiveFinalize = archive.finalize();
    const upload = await this.uploadToS3(passThrough, jobId);
    const result = await upload.done();
    await archiveFinalize;

    return {
      bucket: result.Bucket,
      key: result.Key,
      jobId: jobId,
    };
  }

  protected async processFiles(files: File[], archive: any): Promise<void> {
    await this.driveReadService.processFilesConcurrently(files, archive);
  }

  protected async uploadToS3(passThrough: PassThrough, jobId: string): Promise<any> {
    return this.s3Service.uploadStreamArchiveFile(passThrough, jobId);
  }
}

@Processor('download', {
  concurrency: 10,
  limiter: { max: 100, duration: 5000 },
  removeOnComplete: {
    age: 3600, // 1시간 보관
    count: 1000, // 최대 1000개 유지
  },
  stalledInterval: 30000, // 30초 (밀리초)
  lockDuration: 120000, // 2분 (밀리초)
  maxStalledCount: 3, // 최대 스톨 허용 횟수
  drainDelay: 1000,
})
export class DriveDownloadProcessor extends DriveDownloadDefaultProcessor<{ fileSystemId: string; userId: string }> {
  constructor(driveReadService: DriveReadService, s3Service: S3Service) {
    super(driveReadService, s3Service, false); // multi = false
  }

  protected async getFiles(data: { fileSystemId: string; userId: string }): Promise<File[]> {
    const { fileSystemId, userId } = data;
    return await this.driveReadService.getFolderTree(fileSystemId, userId);
  }

  protected async processFiles(files: File[], archive: any): Promise<void> {
    await this.driveReadService.processFilesConcurrently(files, archive);
  }

  protected async uploadToS3(passThrough: PassThrough, jobId: string): Promise<any> {
    return this.s3Service.uploadStreamArchiveFile(passThrough, jobId);
  }
}
@Processor('multi-download', {
  concurrency: 10,
  limiter: { max: 100, duration: 5000 },
  removeOnComplete: {
    age: 3600, // 1시간 보관
    count: 1000, // 최대 1000개 유지
  },
  stalledInterval: 30000, // 30초 (밀리초)
  lockDuration: 120000, // 2분 (밀리초)
  maxStalledCount: 3, // 최대 스톨 허용 횟수
  drainDelay: 1000,
})
export class DriveMultiDownloadProcessor extends DriveDownloadDefaultProcessor<{
  fileSystemIds: string[];
  types: ('folder' | 'file')[];
  userId: string;
}> {
  constructor(driveReadService: DriveReadService, s3Service: S3Service) {
    super(driveReadService, s3Service, true); // multi = true
  }

  protected async getFiles(data: {
    fileSystemIds: string[];
    types: ('folder' | 'file')[];
    userId: string;
  }): Promise<File[]> {
    const { fileSystemIds, types, userId } = data;
    const files: File[] = [];

    for (let i = 0; i < fileSystemIds.length; i++) {
      if (types[i] === 'folder') {
        files.push(...(await this.driveReadService.getFolderTree(fileSystemIds[i], userId)));
      } else {
        files.push((await this.driveReadService.getFileSystem(fileSystemIds[i])) as File);
      }
    }

    return files;
  }
}
