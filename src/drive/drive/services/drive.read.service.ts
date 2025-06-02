import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { Brackets, EntityNotFoundError, Repository } from 'typeorm';
import { CreateFileSystemDto } from '@/drive/drive/dto/file-system.dto';
import { UserService } from '@/drive/user/services/user.service';
import { User } from '@/drive/user/entities/user.entity';
import {
  FindDriveAllDto,
  FindDriveWithCategoryDto,
  ListCategory,
  ListTarget,
} from '@/drive/drive/dto/file-system-list.dto';
import { File } from '@/drive/drive/entities/file.entity';
import archiver from 'archiver';
import { S3Service } from '@/drive/s3/s3.service';
import { DriveQueue } from '@/drive/drive/drive.queue';
import pLimit from 'p-limit';
import { getChoseong } from 'es-hangul';

type DefaultFindFileSystemType = {
  id: string;
  userId: string;
};

@Injectable()
export class DriveReadService {
  constructor(
    @InjectRepository(FileSystem) private readonly fileSystemRepo: Repository<FileSystem>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly driveQueue: DriveQueue,
  ) {}

  async getFileSystem(id: string) {
    return await this.fileSystemRepo.findOne({ where: { id }, relations: ['children'] });
  }

  async findFileSystem<T extends DefaultFindFileSystemType>(dto: T) {
    const fileSystem = await this.fileSystemRepo.findOne({
      where: { id: dto.id, owner: { user_id: dto.userId } },
      relations: ['worksheet', 'parent'],
    });
    return {
      fileSystem,
      dto,
    };
  }

  async findUserAndPass(dto: CreateFileSystemDto) {
    const { userId, ...others } = dto;
    const user = await this.userService.findUserByUserId({ userId });
    return { user, ...others };
  }

  async generateQueryBuilder(user: User) {
    return this.fileSystemRepo
      .createQueryBuilder('file_system')
      .where('file_system.owner= :userId', { userId: user.user_id });
  }

  async getFileSystemLtreePath(dto: { user: User; path: string } & FindDriveWithCategoryDto) {
    try {
      const { user, path, ...others } = dto;
      const queryBuilder = await this.generateQueryBuilder(user);
      const fileSystem = await queryBuilder
        .andWhere('file_system.id = :path', { path })
        .andWhere('file_system.owner= :userId', { userId: user.user_id })
        .getOneOrFail();

      return {
        folderPath: fileSystem.ltree_path,
        path: fileSystem.path,
        idPath: fileSystem.id_path,
        user,
        ...others,
      };
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('일치하는 파일이 없습니다.');
      }
      throw new InternalServerErrorException('파일 조회 중 오류 발생');
    }
  }

  async getAllChildren(dto: { folderPath: string; idPath: string; path: string; user: User }) {
    const { user, folderPath, idPath, path } = dto;
    const queryBuilder = await this.generateQueryBuilder(user);
    queryBuilder
      .andWhere('file_system.ltree_path <@ :folderPath', { folderPath })
      .andWhere('nlevel(file_system.ltree_path) = nlevel(:folderPath) + 1', { folderPath })
      .andWhere('file_system.ltree_path != :folderPath', { folderPath })
      .orderBy('file_system.updated_at', 'DESC');
    const fileQueryBuilder = queryBuilder.clone();

    const folders = await queryBuilder.andWhere('file_system.type = :type', { type: 'folder' }).take(20).getMany();
    const files = await fileQueryBuilder.andWhere('file_system.type != :type', { type: 'folder' }).getMany();
    return { folders, files, path, idPath };
  }

  async getChildrenWithFilter(dto: {
    category: ListCategory;
    page: number;
    folderPath: string;
    idPath: string;
    path: string;
    user: User;
  }) {
    const { category, page, folderPath, path, idPath, user } = dto;
    const take = 30;
    const skip = (page - 1) * take;

    const queryBuilder = await this.generateQueryBuilder(user);
    queryBuilder
      .andWhere('file_system.ltree_path <@ :folderPath', { folderPath })
      .andWhere('nlevel(file_system.ltree_path) = nlevel(:folderPath) + 1', { folderPath })
      .andWhere('file_system.ltree_path != :folderPath', { folderPath })
      .orderBy('file_system.created_at', 'DESC')
      .take(take)
      .skip(skip);

    // 조건 분기
    if ([ListCategory.FOLDER].includes(category)) {
      queryBuilder.andWhere('file_system.type = :category', { category: category });
    } else {
      queryBuilder.andWhere('file_system.type = :fileType AND file_system.tag = :category', {
        fileType: 'file',
        category,
      });
    }

    const [data, count] = await queryBuilder.getManyAndCount();
    return { data, count, path, idPath };
  }

  async generateSearchQueryBuilder(user: User, search: string) {
    const { choseong, isOnlyChoseong, normalized } = this.getSearchValues(search);
    const baseQueryBuilder = await this.generateQueryBuilder(user);
    baseQueryBuilder
      .addSelect(
        `CASE 
          WHEN file_system.name LIKE :exactPattern THEN 3
          WHEN file_system.choseong LIKE :startWithChoseong THEN 2.5
          WHEN file_system.choseong LIKE :choseongPattern THEN 2
          WHEN file_system.name % :similarText THEN 1
          ELSE 0
         END`,
        'priority',
      )
      .addSelect(`bigm_similarity(file_system.name, :similarText)`, 'name_similarity')
      .addSelect(`bigm_similarity(file_system.choseong, :choseongText)`, 'choseong_similarity')
      .andWhere(
        new Brackets((qb) => {
          qb.andWhere(
            isOnlyChoseong
              ? `file_system.choseong LIKE :startWithChoseong OR file_system.choseong LIKE :choseongPattern OR file_system.name % :similarText`
              : `file_system.name LIKE :exactPattern OR file_system.name % :similarText OR file_system.choseong LIKE :choseongPattern`,
          );
        }),
      )
      .setParameters({
        exactPattern: `%${normalized}%`,
        similarText: normalized,
        choseongPattern: `%${choseong}%`,
        choseongText: choseong,
        startWithChoseong: `${choseong}%`,
      })
      .orderBy('priority', 'DESC')
      .addOrderBy(isOnlyChoseong ? 'choseong_similarity' : 'name_similarity', 'DESC')
      .addOrderBy('file_system.created_at', 'DESC');
    return baseQueryBuilder;
  }

  getSearchValues(search: string) {
    const normalized = search.normalize('NFC');
    const choseong = getChoseong(normalized);
    const isOnlyChoseong = /^[ㄱ-ㅎ]+$/.test(normalized);
    return { normalized, choseong, isOnlyChoseong };
  }

  async getFileSystemWithSearch(dto: { search: string; user: User }) {
    const { user, search } = dto;

    const baseQueryBuilder = await this.generateSearchQueryBuilder(user, search);
    const folderQueryBuilder = baseQueryBuilder.clone();
    const fileQueryBuilder = baseQueryBuilder.clone();
    folderQueryBuilder.andWhere('file_system.type = :folderType').setParameter('folderType', 'folder');
    fileQueryBuilder.andWhere('file_system.type != :fileType').setParameter('fileType', 'folder');

    const folders = await folderQueryBuilder.getMany();
    const files = await fileQueryBuilder.getMany();
    return { folders, files };
  }

  async getFileSystemWithSearchAndCategory(dto: { search: string; user: User; category: ListCategory; page: number }) {
    const { search, user, category, page } = dto;
    const take = 30;
    const skip = (page - 1) * take;

    const queryBuilder = await this.generateSearchQueryBuilder(user, search);
    queryBuilder.take(take).skip(skip);
    if (category) {
      if (category === 'folder') {
        queryBuilder.andWhere(`file_system.type =:type`, { type: 'folder' });
        // } else if (category === 'wiive') {
        //   queryBuilder.andWhere(`file_system.type =:type`, { type: 'worksheet' });
      } else {
        queryBuilder.andWhere(`file_system.tag = :tag`, { tag: category });
      }
    }
    const [data, count] = await queryBuilder.getManyAndCount();
    return { data, count };
  }

  async generateStarredOrTrashQueryBuilder(user: User, target: ListTarget, name?: string) {
    const queryBuilder = await this.generateQueryBuilder(user);
    queryBuilder
      .leftJoinAndSelect('file_system.worksheet', 'worksheet')
      .leftJoinAndSelect('file_system.parent', 'parent');
    if (name) {
      queryBuilder.andWhere(`file_system.name LIKE :name`, { name: `%${name}%` });
    }
    if (target === 'starred') {
      queryBuilder.andWhere('file_system.is_starred = true');
      queryBuilder.andWhere('file_system.deleted_at IS NULL');
      queryBuilder.orderBy('file_system.starred_at', 'DESC');
    }
    if (target === 'trash') {
      queryBuilder.withDeleted();
      queryBuilder.andWhere('file_system.deleted_at IS NOT NULL');
      queryBuilder.orderBy('file_system.deleted_at', 'DESC');
    }

    return queryBuilder;
  }

  async findStarredOrTrash(findStarredOrDeletedWithCategoryDto: FindDriveWithCategoryDto & { user: User }) {
    const { page, target, user, ...filter } = findStarredOrDeletedWithCategoryDto;
    const queryBuilder = await this.generateStarredOrTrashQueryBuilder(user, target, filter?.name ?? '');

    if (filter.category) {
      if (filter.category === 'folder') {
        queryBuilder.andWhere(`file_system.type =:type`, { type: 'folder' });
      } else {
        queryBuilder.andWhere(`file_system.tag = :tag`, { tag: filter.category });
      }
    }

    queryBuilder.skip((page - 1) * 30);
    queryBuilder.take(30);

    const [data, count] = await queryBuilder.getManyAndCount();
    return { data, count };
  }

  async findStarredOrTrashAll(findStarredOrDeleteAllDto: FindDriveAllDto & { user: User }) {
    const { target, user, ...filter } = findStarredOrDeleteAllDto;
    const queryBuilder = await this.generateStarredOrTrashQueryBuilder(user, target, filter?.name ?? '');
    const folderQueryBuilder = queryBuilder.clone();
    folderQueryBuilder.andWhere('file_system.type = :type', { type: 'folder' }).take(20);
    const folders = await folderQueryBuilder.getMany();
    queryBuilder.andWhere('file_system.type != :type', { type: 'folder' });
    const files = await queryBuilder.getMany();
    return { folders, files };
  }

  async addDownloadQueue(fileSystemId: string, userId: string) {
    return this.driveQueue.addDownload(fileSystemId, userId);
  }

  async addDownloadMultipleQueue(fileSystemIds: string[], types: ['folder' | 'file'], userId: string) {
    return this.driveQueue.addDownloadMultiple(fileSystemIds, types, userId);
  }

  async getFolderTree(fileSystemId: string, user_id: string): Promise<File[]> {
    const target = await this.fileSystemRepo.findOne({
      where: { id: fileSystemId },
    });
    const queryBuilder = await this.generateQueryBuilder({ user_id } as User);

    return (await queryBuilder
      .andWhere('file_system.ltree_path <@ :parentPath', {
        parentPath: target.ltree_path,
      })
      .andWhere('file_system.type = :type', { type: 'file' })
      .orderBy('file_system.ltree_path', 'ASC')
      .getMany()) as File[];
  }

  getRelativePath(file: FileSystem): string {
    // 1. 경로 정규화
    const normalizedPath = file.path
      .replace(/\\/g, '/') // 백슬래시 → 슬래시
      .replace(/\/+/g, '/') // 중복 슬래시 제거
      .replace(/^\/+/, '') // 앞 슬래시 제거 (압축 내부는 상대경로가 일반적)
      .replace(/\/+$/, ''); // 뒤 슬래시 제거

    // 2. 빈 경로 체크
    if (!normalizedPath || normalizedPath.trim() === '') {
      throw new Error(`유효하지 않은 파일 경로: ${file.path}`);
    }

    // 3. 특수 문자 처리 (파일명만)
    const parts = normalizedPath.split('/');
    parts[parts.length - 1] = parts[parts.length - 1]
      .normalize('NFC')
      .replace(/ /g, '_')
      .replace(/[^a-zA-Z0-9가-힣_\-.]/g, '_');

    return parts.join('/');
  }

  async addFileToArchive(file: File, archive: archiver.Archiver) {
    const relativePath = this.getRelativePath(file);
    const s3Stream = await this.s3Service.getFileStream('tms-drive', file);
    archive.append(s3Stream, { name: relativePath });
  }

  async processFilesConcurrently(files: File[], archive: archiver.Archiver) {
    const validFiles = files.filter((file) => {
      try {
        this.getRelativePath(file);
        return true;
      } catch (error) {
        return false;
      }
    });

    const limit = pLimit(20);

    const promises = validFiles.map(async (file) => limit(() => this.addFileToArchive(file, archive)));

    return await Promise.all(promises);
  }

  async getDownloadStatus(jobId: string) {
    return this.driveQueue.getDownload(jobId);
  }

  // TODO Cache 전략 추가
  // async getCachedTree(folderId: string) {
  //   const cacheKey = `folder_tree:${folderId}`;
  //   const cached = await this.redis.get(cacheKey);
  //
  //   if (cached) return JSON.parse(cached);
  //
  //   const tree = await this.getFolderTree(folderId);
  //   await this.redis.setex(cacheKey, 300, JSON.stringify(tree));
  //   return tree;
  // }
}
