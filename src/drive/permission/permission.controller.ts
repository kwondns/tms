import { Controller } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';

@Controller('permission')
export class PermissionController {
  constructor(private readonly dataSource: DataSource) {}

  @Cron('0 3 * * *') // 매일 오전 3시 실행
  async cleanupOrphanedFileSystems() {
    const orphanedFiles = await this.dataSource
      .createQueryBuilder(FileSystem, 'fs')
      .leftJoin('fs.permissions', 'p')
      .having('COUNT(p.id) = 0')
      .groupBy('fs.id')
      .getMany();

    await this.dataSource.getRepository(FileSystem).remove(orphanedFiles);
  }
}
