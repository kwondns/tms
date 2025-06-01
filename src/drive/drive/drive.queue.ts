import { Injectable } from '@nestjs/common';
import { BullRegistrar, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

@Injectable()
export class DriveQueue {
  constructor(
    @InjectQueue('delete-drive') private readonly deleteQueue: Queue,
    @InjectQueue('download') private readonly downloadQueue: Queue,
    private readonly bullRegistrar: BullRegistrar,
  ) {}

  async onModuleInit() {
    this.bullRegistrar.register();
  }

  async addCleanUp(fileId: string, lifo: boolean = false) {
    return this.deleteQueue.add(
      'delete-drive',
      { fileId },
      {
        lifo,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 30000,
        },
        jobId: `cleanup-${fileId}`,
        removeOnComplete: 3600,
        priority: lifo ? 1 : 2,
      },
    );
  }

  async addDownload(fileSystemId: string, userId: string) {
    return this.downloadQueue.add(
      'download',
      {
        fileSystemId,
        userId,
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: true,
        stackTraceLimit: 5,
      },
    );
  }

  async addDownloadMultiple(fileSystemIds: string[], types: ['folder' | 'file'], userId: string) {
    return this.downloadQueue.add(
      'multi-download',
      { fileSystemIds, types, userId },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: true,
        stackTraceLimit: 5,
      },
    );
  }

  async getDownload(jobId: string) {
    const job: Job = await this.downloadQueue.getJob(jobId);
    const state = await job.getState();
    switch (state) {
      case 'active':
        return { state: 'running' };
      case 'failed':
        return { state: 'failed' };
      case 'completed':
        return { state: 'completed', data: job.returnvalue };
    }
  }
}
