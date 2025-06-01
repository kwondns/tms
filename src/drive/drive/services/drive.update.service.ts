import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { UpdateFolderDto } from '@/drive/drive/dto/folder.dto';
import { WorksheetFileSystem } from '@/drive/drive/entities/worksheet-file-system.entity';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import { Folder } from '@/drive/drive/entities/folder.entity';

@Injectable()
export class DriveUpdateService {
  constructor(
    @InjectRepository(FileSystem) private readonly fileSystemRepo: Repository<FileSystem>,
    @Inject(forwardRef(() => DriveCreateService)) private readonly driveCreateService: DriveCreateService,

    private readonly dataSource: DataSource,
  ) {}
  async updateName(obj: {
    dto: UpdateFolderDto & { queryRunner: QueryRunner };
    fileSystem: FileSystem | WorksheetFileSystem;
  }) {
    const { dto, fileSystem } = obj;
    if (dto.name) {
      dto.oldName = fileSystem.name;
      const checkUniqueNameDto = {
        userId: dto.userId,
        parentId: dto.parentId,
        name: dto.name,
      };
      const newDto = await this.driveCreateService.checkAlreadyExistNameAndMakeUnique(
        fileSystem.type,
        checkUniqueNameDto,
      );
      fileSystem.name = newDto.name;
      const tmpPath = fileSystem.path.split('/');
      tmpPath.pop();
      tmpPath.push(newDto.name);
      fileSystem.path = tmpPath.join('/');
      const tmpLtreePath = fileSystem.ltree_path.split('.');
      tmpLtreePath.pop();
      fileSystem.ltree_path = this.driveCreateService.generateLtreePath(newDto.name, {
        ltree_path: tmpLtreePath.join('.'),
      } as FileSystem);
      if (fileSystem instanceof WorksheetFileSystem) fileSystem.worksheet.name = newDto.name;
    }
    return { fileSystem, dto };
  }

  async updateIsStarred(obj: { dto: UpdateFolderDto; fileSystem: FileSystem }) {
    const { dto, fileSystem } = obj;
    if (dto.isStarred !== undefined) {
      fileSystem.is_starred = dto.isStarred;
      fileSystem.starred_at = new Date();
      if (dto.isStarred === false) fileSystem.starred_at = null;
    }
    return { fileSystem, dto };
  }

  async updatePath(obj: { dto: UpdateFolderDto; fileSystem: FileSystem }) {
    const { dto, fileSystem } = obj;
    if (dto.parentId) {
      const newParent = await this.fileSystemRepo.findOne({ where: { id: dto.parentId } });
      if (!newParent) {
        throw new NotFoundException();
      }

      if (newParent.id === fileSystem.id) {
        throw new BadRequestException();
      }

      const oldLtreePath = fileSystem.ltree_path;
      const oldIdPath = fileSystem.id_path;
      const oldPath = fileSystem.path;

      fileSystem.parent = newParent;
      fileSystem.path = `${newParent.path}/${fileSystem.name}`;
      fileSystem.ltree_path = this.driveCreateService.generateLtreePath(fileSystem.name, newParent);

      await this.updateDescendantPaths(
        oldLtreePath,
        fileSystem.ltree_path,
        oldIdPath,
        fileSystem.id_path,
        oldPath,
        fileSystem.path,
      );
    }
    return { fileSystem, dto };
  }
  private async updateDescendantPaths(
    oldLtreePath: string,
    newLtreePath: string,
    oldIdPath: string,
    newIdPath: string,
    oldPath: string,
    newPath: string,
  ) {
    try {
      // 1. ltree_path 업데이트
      await this.dataSource.query(
        `
        UPDATE file_system
        SET ltree_path = 
          $1::ltree || subpath(ltree_path, nlevel($2::ltree))
        WHERE ltree_path <@ $2::ltree AND ltree_path != $2::ltree
      `,
        [newLtreePath, oldLtreePath],
      );

      // 2. id_path 업데이트
      await this.dataSource.query(`
        UPDATE file_system
        SET id_path = '${newIdPath}'
        WHERE id_path = '${oldIdPath}'
      `);

      // 3. path 업데이트
      await this.dataSource.query(`
        UPDATE file_system
        SET path = '${newPath}'
        WHERE path = '${oldPath}'
      `);
    } catch (e) {
      console.error(e);
    }
  }

  async updateFileSystem(obj: { fileSystem: FileSystem; dto: { queryRunner: QueryRunner; oldName?: string } }) {
    const { dto, fileSystem } = obj;
    const { queryRunner } = dto;
    const result = await queryRunner.manager.getRepository(FileSystem).save(fileSystem);
    if (dto.oldName) return { oldName: dto.oldName, result };
    return result;
  }

  async restoreFile(fileId: string, userId: string, queryRunner: QueryRunner): Promise<FileSystem> {
    // 복원 대상 파일/폴더 조회
    const file = await this.fileSystemRepo.findOne({
      where: { id: fileId, owner: { user_id: userId } },
      withDeleted: true,
      relations: ['parent'],
    });

    if (!file) {
      throw new Error('File or folder not found');
    }
    try {
      const checkUniqueNameDto = {
        userId,
        parentId: file.parent.id,
        name: file.name,
      };
      const newDto = await this.driveCreateService.checkAlreadyExistNameAndMakeUnique(file.type, checkUniqueNameDto);
      await queryRunner.manager.getRepository('file_system').restore(fileId);
      await queryRunner.manager.getRepository('file_system').update({ id: fileId }, { name: newDto.name });
      return file;
    } catch (e) {
      throw e;
    }
  }

  async increaseCount(parentId: string, userId: string, count: number, queryRunner: QueryRunner) {
    const FolderRepo = queryRunner.manager.getRepository(Folder);
    await FolderRepo.increment({ id: parentId, owner: { user_id: userId } }, 'children_count', count);
  }

  async decreaseCount(parentId: string, userId: string, count: number, queryRunner: QueryRunner) {
    const FolderRepo = queryRunner.manager.getRepository(Folder);
    await FolderRepo.decrement({ id: parentId, owner: { user_id: userId } }, 'children_count', count);
  }
}
