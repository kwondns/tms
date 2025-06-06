import { Inject, Injectable } from '@nestjs/common';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { DataSource, LessThan, QueryRunner, Repository } from 'typeorm';
import asyncPipe, { execFuncOnly } from '@/utils/asyncPipe';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveQueue } from '@/drive/drive/drive.queue';
import { S3Service } from '@/drive/s3/s3.service';
import AppConfig from '@/drive/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class DriveDeleteService {
  constructor(
    @InjectRepository(FileSystem) private readonly fileSystemRepo: Repository<FileSystem>,
    private readonly driveQueue: DriveQueue,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}
  async softDeleteFile({ fileSystem }: { fileSystem: FileSystem }) {
    await this.fileSystemRepo.softDelete(fileSystem.id);
    return fileSystem.parent.id;
  }

  async deleteCompletelyFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileSystemRepo.findOne({
      where: { id: fileId, owner: { user_id: userId } },
      relations: ['children'], // 트리를 탐색하기 위해 자식 로드
      withDeleted: true, // Soft delete된 데이터도 포함
    });

    if (!file) throw new Error('File not found');

    await this.s3DeleteTransaction(fileId);
  }

  async cleanupSoftDeletedFiles() {
    const now = new Date();
    const offsetDate = new Date(now.getTime() - Number(this.config.fileDestroyDelay));

    // 논리 삭제된 지 14일이 지난 부모 엔티티 조회
    const filesToDelete = await this.fileSystemRepo.find({
      where: { deleted_at: LessThan(offsetDate) },
      withDeleted: true, // Soft delete된 데이터 포함
      relations: ['children'], // 자식 관계 로드
    });

    for (const file of filesToDelete) {
      await this.driveQueue.addCleanUp(file.id);
    }
  }

  async findDeletePathWithChildren(queryRunner: QueryRunner, id: string) {
    const result = await queryRunner.query(
      `SELECT fs.storage_path, fs.id, fs.size, fs."ownerUserId" as userId
       FROM file_system fs
                JOIN file_system_closure c ON fs.id = c.id_descendant
       WHERE c.id_ancestor = $1
         `,
      [id],
    );
    return result;
  }

  async deleteNotFileTypeFileSystem(
    queryRunner: QueryRunner,
    files: { id: string; size: number | null; storage_path: string | null; userId: string }[],
  ) {
    const toDeleteIds = files
      .filter((f) => (f.storage_path === null || f.size === null) && f.id)
      .map((f) => f.id)
      .filter((id) => !!id);
    if (toDeleteIds.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('file_system_closure')
        .where('"id_descendant" IN (:...ids)', { ids: toDeleteIds })
        .execute();
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('permission')
        .where('"fileSystemId" IN (:...ids)', { ids: toDeleteIds })
        .execute();
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('file_system')
        .where('id IN (:...ids)', { ids: toDeleteIds })
        .execute();
    }

    // 2. 남은 배열: storage_path와 size가 모두 null이 아닌 파일만 반환
    console.log(files);
    return files.filter((f) => f.storage_path !== null && f.size !== null) as {
      id: string;
      size: number;
      storage_path: string;
      userId: string;
    }[];
  }

  async decreaseUserStorageUsed(
    queryRunner: QueryRunner,
    files: { size: number; storage_path: string; userId: string }[],
  ) {
    const userFileMap = new Map<string, number>();
    for (const file of files) {
      userFileMap.set(file.userId, (userFileMap.get(file.userId) || 0) + file.size);
    }

    // 2. 각 userId별로 storage_used 차감
    for (const [userId, totalSize] of userFileMap.entries()) {
      // 락을 걸고 현재 storage_used 조회
      const user = await queryRunner.manager.getRepository('user').findOne({
        where: { user_id: userId },
        relations: ['user_storage'],
      });
      const userStorage = await queryRunner.manager
        .getRepository('user_storage')
        .createQueryBuilder('user_storage')
        .setLock('pessimistic_write')
        .where('user_storage.id = :id', { id: user.user_storage.id })
        .getOne();

      // 차감 후 업데이트
      const newStorageUsed = Math.max(0, userStorage.storage_used - totalSize);
      await queryRunner.manager
        .getRepository('user_storage')
        .update({ id: userStorage.id }, { storage_used: newStorageUsed });
    }

    return files.map((v) => v.storage_path);
  }

  async hardDeleteEntireTree(queryRunner: QueryRunner, fileId: string): Promise<void> {
    // 1. 삭제할 id 목록 조회
    const ids = await queryRunner.query(
      `SELECT id_descendant
                                           FROM file_system_closure
                                           WHERE id_ancestor = $1`,
      [fileId],
    );
    const idList = ids.map((row) => row.id_descendant);
    if (idList.length === 0) return;
    // 2. closure table에서 먼저 삭제
    const placeholders = idList.map((_, index) => `$${index + 1}`).join(',');
    const closure_query = `DELETE
                             FROM file_system_closure
                             WHERE id_descendant IN (${placeholders})`;
    await queryRunner.query(closure_query, idList);

    // 3. permission 삭제
    const permission_query = `DELETE
                                FROM permission
                                WHERE "fileSystemId" IN (${placeholders})`;
    await queryRunner.query(permission_query, idList);

    // 4. file_system에서 삭제
    const system_query = `DELETE
                            FROM file_system
                            WHERE id IN (${placeholders}) `;
    await queryRunner.query(system_query, idList);
  }

  async s3DeleteTransaction(fileId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pipeline = await asyncPipe(
        this.findDeletePathWithChildren.bind(this, queryRunner),
        this.deleteNotFileTypeFileSystem.bind(this, queryRunner),
        this.decreaseUserStorageUsed.bind(this, queryRunner),
        (files) => execFuncOnly(this.hardDeleteEntireTree.bind(this, queryRunner, fileId), files),
        this.s3Service.bulkDelete.bind(this.s3Service, 'tms-drive-user'),
      );
      await pipeline(fileId);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
