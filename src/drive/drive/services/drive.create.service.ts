import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { UserService } from '@/drive/user/services/user.service';
import { CreateFileSystemDto, FileSystemType, NewFileSystemDto } from '@/drive/drive/dto/file-system.dto';
import { CreateFileDto, NewFileDto, S3PutDto } from '@/drive/drive/dto/file.dto';
import { CreateWorksheetFileSystemDto, NewWorksheetFileSystemDto } from '@/drive/drive/dto/worksheet-file-system.dto';
import { File } from '@/drive/drive/entities/file.entity';
import { Folder } from '@/drive/drive/entities/folder.entity';
import { WorksheetFileSystem } from '@/drive/drive/entities/worksheet-file-system.entity';
import { PermissionRole } from '@/drive/drive/entities/permission.entity';
import asyncPipe from '@/utils/asyncPipe';
import { SaveFolderDto } from '@/drive/drive/dto/folder.dto';
import { RomanizationSystem, romanize } from '@romanize/korean';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { UploadResultType, UploadSuccessType } from '@/drive/s3/s3.type';
import { User } from '@/drive/user/entities/user.entity';
import { S3Service } from '@/drive/s3/s3.service';
import { DriveUpdateService } from '@/drive/drive/services/drive.update.service';
import { PermissionService } from '@/drive/permission/permission.service';
import crypto from 'crypto';

@Injectable()
export class DriveCreateService {
  constructor(
    @InjectRepository(FileSystem) private readonly fileSystemRepo: Repository<FileSystem>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => DriveUpdateService)) private readonly driveUpdateService: DriveUpdateService,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly driveReadService: DriveReadService,
    private readonly permissionService: PermissionService,
  ) {}
  // 새로운 이름 생성 함수
  async generateUniqueName(
    repo: Repository<FileSystem>,
    originalName: string,
    parentId: string,
    type: FileSystemType,
    userId: string,
  ) {
    const { basePart, extension } = this.parseFileName(originalName);
    const escapedBase = this.escapeRegExp(basePart);
    const escapedExt = this.escapeRegExp(extension);

    const existingFiles = await repo
      .createQueryBuilder()
      .where('"parentId" = :parentId AND type = :type AND "ownerUserId" = :userId', {
        parentId,
        type,
        userId,
      })
      .andWhere(`name LIKE :pattern ESCAPE '\\'`, {
        pattern: `${escapedBase}%${escapedExt}`, // LIKE 연산자 사용
      })
      .getMany();

    const numbers = existingFiles.flatMap((file) => {
      const matches = [...file.name.matchAll(/\((\d+)\)/g)];
      return matches.map((m) => parseInt(m[1]));
    });

    const maxNumber = Math.max(0, ...numbers);
    return `${basePart}(${maxNumber + 1})${extension}`;
  }
  // 파일명 파싱 함수
  parseFileName(originalName: string) {
    const regex = /^(.*?)(?: \((\d+)\))?(\.[^.]+)?$/;
    const match = RegExp(regex).exec(originalName);

    return {
      basePart: match[1] || originalName,
      number: match[2] ? parseInt(match[2]) : null,
      extension: match[3] || '',
    };
  }

  // 정규식 특수문자 이스케이프 함수
  escapeRegExp(str: string) {
    return str.replace(/[%_]/g, (s) => '\\' + s);
  }
  async checkAlreadyExistNameAndMakeUnique(type: FileSystemType, dto: CreateFileSystemDto) {
    const { name, parentId, userId } = dto;

    const exist = await this.fileSystemRepo.findOne({
      where: { name: name.normalize('NFC'), type, parent: { id: parentId }, owner: { user_id: userId } },
    });
    if (!exist) return dto;

    let newName = name;

    newName = await this.generateUniqueName(this.fileSystemRepo, newName, parentId, type, userId);
    dto.name = newName;
    return dto;
  }

  generateLtreePath(name: string, parent?: FileSystem): string {
    // 1. 문자 정규화 및 필터링
    const sanitized = name
      .normalize('NFKC') // NFC → NFKC로 변경하여 더 넓은 범위 처리
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_\-.]/gu, '') // 유니코드 문자/숫자, '-', '_', '.' 허용
      .replace(/([\.\-])/g, '_') // '.'과 '-'를 '_'로 일괄 치환
      .replace(/_+/g, '_');

    // 2. 로마자 변환 (한글 → 영문)
    const romanized = sanitized.replace(
      /[가-힣]/g,
      (match) => romanize(match, { system: RomanizationSystem.REVISED })?.replace(/ /g, '_') || '',
    );

    // 3. 고유 해시 생성 (부모 경로 포함)
    const hashInput = parent?.ltree_path ? `${parent.ltree_path}|${romanized}` : romanized;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 8); // 8자리로 확장

    // 4. 길이 제한 (255 - 해시길이 - 1)
    const maxBaseLength = 255 - 9; // '_' + 8자 해시
    const truncated = romanized.slice(0, maxBaseLength);

    // 5. 최종 경로 조합
    const parentPath = parent?.ltree_path ? `${parent.ltree_path}.` : '';
    return `${parentPath}${truncated}_${hash}`;
  }

  async newFileSystem(
    queryRunner: QueryRunner,
    type: FileSystemType,
    newFileSystemDto: NewFileSystemDto | NewFileDto | NewWorksheetFileSystemDto,
  ) {
    const { user, name, ...others } = newFileSystemDto;
    const newFileSystemObject = { ...others, name: name.normalize('NFC'), type, owner: user, updated_at: new Date() };
    if (newFileSystemDto.parentId) {
      const parent = await this.driveReadService.getFileSystem(newFileSystemDto.parentId);
      const newPath = `${parent.path}/${newFileSystemDto.name}`;

      const newLtreePath = this.generateLtreePath(newFileSystemDto.name, parent);
      Object.assign(newFileSystemObject, { path: newPath, ltree_path: newLtreePath, parent });
    } else Object.assign(newFileSystemObject, { path: '', ltree_path: 'top' });
    let targetRepository: typeof File | typeof Folder | typeof WorksheetFileSystem;
    switch (type) {
      case 'file':
        targetRepository = File;
        break;
      case 'folder':
        targetRepository = Folder;
        break;
      case 'worksheet':
        targetRepository = WorksheetFileSystem;
        break;
    }
    return queryRunner.manager.getRepository(targetRepository).create(newFileSystemObject);
  }

  async saveFileSystem(queryRunner: QueryRunner, fileSystem: FileSystem) {
    let targetRepository: typeof File | typeof Folder | typeof WorksheetFileSystem;
    switch (fileSystem.type) {
      case 'file':
        targetRepository = File;
        break;
      case 'folder':
        targetRepository = Folder;
        break;
      case 'worksheet':
        targetRepository = WorksheetFileSystem;
        break;
    }
    const savedFileSystem = await queryRunner.manager.getRepository(targetRepository).save(fileSystem);
    if ('is_root' in savedFileSystem && savedFileSystem.is_root === true) {
      savedFileSystem.id_path = `/${savedFileSystem.id}`;
      return await queryRunner.manager.getRepository(targetRepository).save(savedFileSystem);
    }

    if (savedFileSystem.parent) {
      savedFileSystem.id_path = `${savedFileSystem.parent.id_path}/${savedFileSystem.id}`;
      return await queryRunner.manager.getRepository(targetRepository).save(savedFileSystem);
    }
    return savedFileSystem;
  }

  async saveFileSystemWithPermissions(
    createFileSystemDto: CreateFileSystemDto | CreateFileDto | CreateWorksheetFileSystemDto,
    type: FileSystemType,
    externalQueryRunner?: QueryRunner,
  ) {
    const isLocalQueryRunner = !externalQueryRunner;
    const queryRunner = externalQueryRunner ?? this.dataSource.createQueryRunner();
    if (isLocalQueryRunner) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }
    if (type === 'folder') {
      await this.driveUpdateService.increaseCount(
        createFileSystemDto.parentId,
        createFileSystemDto.userId,
        1,
        queryRunner,
      );
    }

    try {
      const pipeline = await asyncPipe<SaveFolderDto>(
        this.checkAlreadyExistNameAndMakeUnique.bind(this, type),
        this.driveReadService.findUserAndPass.bind(this.driveReadService),
        this.newFileSystem.bind(this, queryRunner, type),
        this.saveFileSystem.bind(this, queryRunner),
        this.permissionService.createPermissionPipeline.bind(this.permissionService, queryRunner, PermissionRole.OWNER),
      );
      const result = await pipeline(createFileSystemDto);

      if (isLocalQueryRunner) await queryRunner.commitTransaction();
      return result.fileSystem;
    } catch (error) {
      if (isLocalQueryRunner) await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (isLocalQueryRunner) await queryRunner.release();
    }
  }

  async calculateFileSize(files: Array<Express.Multer.File>, user: User) {
    let currentStorageUsed = user.user_storage.storage_used;
    let lastFileIndex = 0;
    for (let i = 0; i < files.length && user.user_storage.storage_limit >= currentStorageUsed; i++) {
      currentStorageUsed += files[i].size;
      lastFileIndex++;
    }
    return lastFileIndex;
  }

  async s3PutTransaction(s3PutDto: S3PutDto) {
    const { userId, files } = s3PutDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let fileResult: UploadResultType = [];
    try {
      const user: User = (await queryRunner.manager.getRepository('user').findOne({
        where: { user_id: userId },
        relations: ['user_storage'],
      })) as User;
      const storageCalcPipe = await asyncPipe(
        this.userService.findUserByUserId.bind(this.userService),
        this.calculateFileSize.bind(this, files),
      );

      const lastFileIndex = await storageCalcPipe({ userId });
      fileResult = await this.s3Service.uploadHandler('tms-drive', files.slice(0, lastFileIndex), userId);
      const totalUploadedSize = fileResult.reduce((sum, item) => {
        return sum + (item.success ? item.size : 0);
      }, user.user_storage.storage_used);

      await this.userService.updateUserStorage(user, totalUploadedSize);
      let count = 0;
      const result = [];
      for (const file of fileResult) {
        const index = fileResult.indexOf(file);
        if (file.success) {
          count++;
          const createFileDto = new CreateFileDto();
          createFileDto.parentId = s3PutDto.parentId;
          createFileDto.userId = s3PutDto.userId;
          createFileDto.size = files[index].size;
          createFileDto.mimetype = files[index].mimetype;
          createFileDto.storage_path = file.filePath;
          createFileDto.tag = s3PutDto.tags[index];
          createFileDto.name = files[index].originalname.normalize('NFC');
          result.push({
            index,
            success: file.success,
            result: await this.saveFileSystemWithPermissions(createFileDto, 'file', queryRunner),
          });
        } else result.push({ index, success: file.success, originalName: file.originalName, event: 'upload' });
      }
      if (lastFileIndex !== files.length) {
        result.push(
          ...Array.from({ length: files.length - lastFileIndex - 1 }, (_v, index) => ({
            index: lastFileIndex + index + 1,
            success: false,
            originalName: files[lastFileIndex + index + 1].originalname,
            event: 'storage',
          })),
        );
      }
      await this.driveUpdateService.increaseCount(s3PutDto.parentId, userId, count, queryRunner);
      await queryRunner.commitTransaction();
      return { result, storageUsed: user.user_storage.storage_used, storageLimit: user.user_storage.storage_limit };
    } catch (e) {
      if (fileResult.length > 0) {
        const deleteTarget = fileResult.filter((item) => item.success).map((file: UploadSuccessType) => file.filePath);
        await this.s3Service.bulkDelete('tms-drive', deleteTarget);
      }
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
