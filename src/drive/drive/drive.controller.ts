import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DeleteFolderDto, UpdateFolderDto } from '@/drive/drive/dto/folder.dto';
import asyncPipe from '@/utils/asyncPipe';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreateFilePayloadDto, CreateFileResponseDto } from '@/drive/drive/dto/file.dto';
import {
  CreateFileSystemDto,
  FileSystemDriveAllResponseDto,
  FileSystemDriveResponseDto,
  FileSystemResponseDataDto,
} from '@/drive/drive/dto/file-system.dto';
import { FindWorksheetDto } from '@/drive/worksheet/dto/find-worksheet.dto';
import { UserService } from '@/drive/user/services/user.service';
import { WorksheetService } from '@/drive/worksheet/worksheet.service';
import { FindDriveAllDto, FindDriveWithCategoryDto } from '@/drive/drive/dto/file-system-list.dto';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { WorksheetResponseDto } from '@/drive/drive/dto/worksheet-response.dto';
import { S3Service } from '@/drive/s3/s3.service';
import { File } from '@/drive/drive/entities/file.entity';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import { DriveUpdateService } from '@/drive/drive/services/drive.update.service';
import { DriveDeleteService } from '@/drive/drive/services/drive.delete.service';
import { DataSource } from 'typeorm';
import { SignInResponseDto } from '@/drive/user/dto/sign-in.dto';

@Controller('drive')
export class DriveController {
  constructor(
    private readonly driveReadService: DriveReadService,
    private readonly driveCreateService: DriveCreateService,
    private readonly driveUpdateService: DriveUpdateService,
    private readonly driveDeleteService: DriveDeleteService,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly worksheetService: WorksheetService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('folder')
  @Serialize(FileSystemResponseDataDto)
  async createFolder(@Body() body: CreateFileSystemDto) {
    return await this.driveCreateService.saveFileSystemWithPermissions(body, 'folder');
  }

  /**
   * Search -> Get('/drive/search-all?name=aaa')
   *
   * SearchWithCategory -> Get('/drive/search?name=aaa&category=print')
   *
   * all -> Get('/drive/all?path=asdf')
   *
   * category -> Get('/drive?path=asdf&category=print')
   */

  @Get('all')
  @Serialize(FileSystemDriveAllResponseDto)
  async getAllItems(@Query('path') path: string, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.getFileSystemLtreePath.bind(this.driveReadService),
      this.driveReadService.getAllChildren.bind(this.driveReadService),
    );
    return await pipeline({ ...body, path });
  }

  @Get()
  @Serialize(FileSystemDriveResponseDto)
  async getItemsFilter(@Query() query: FindDriveWithCategoryDto, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.getFileSystemLtreePath.bind(this.driveReadService),
      this.driveReadService.getChildrenWithFilter.bind(this.driveReadService),
    );
    return pipeline({ ...body, ...query });
  }

  @Get('search-all')
  @Serialize(FileSystemDriveAllResponseDto)
  async getSearchItems(@Query() query: { search: string }, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.getFileSystemWithSearch.bind(this.driveReadService),
    );
    return await pipeline({ ...body, ...query });
  }

  @Get('search')
  @Serialize(FileSystemDriveResponseDto)
  async getSearchFilterItem(@Query() query: FindDriveWithCategoryDto, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.getFileSystemWithSearchAndCategory.bind(this.driveReadService),
    );
    return await pipeline({ ...query, ...body });
  }

  @Get('worksheet')
  @Serialize(WorksheetResponseDto)
  async findWithFilter(@Query() query: FindWorksheetDto, @Body() body: { user_id: string }) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.worksheetService.findWithFilter.bind(this.worksheetService, { ...query }),
    );
    return await pipeline(body);
  }

  @Get('starred-all')
  @Serialize(FileSystemDriveAllResponseDto)
  async findStarredAll(@Query() query: FindDriveAllDto, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.findStarredOrTrashAll.bind(this.driveReadService),
    );
    return await pipeline({ ...body, ...query, target: 'starred' });
  }

  @Get('trash-all')
  @Serialize(FileSystemDriveAllResponseDto)
  async findTrashAll(@Query() query: FindDriveAllDto, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.findStarredOrTrashAll.bind(this.driveReadService),
    );
    return await pipeline({ ...body, ...query, target: 'trash' });
  }

  @Get('starred')
  @Serialize(FileSystemDriveResponseDto)
  async findStarred(@Query() query: FindDriveWithCategoryDto, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.findStarredOrTrash.bind(this.driveReadService),
    );
    return await pipeline({ ...body, ...query, target: 'starred' });
  }

  @Get('trash')
  @Serialize(FileSystemDriveResponseDto)
  async findTrash(@Query() query: FindDriveWithCategoryDto, @Body() body: { userId: string }) {
    const pipeline = await asyncPipe(
      this.driveReadService.findUserAndPass.bind(this.driveReadService),
      this.driveReadService.findStarredOrTrash.bind(this.driveReadService),
    );
    return await pipeline({ ...body, ...query, target: 'trash' });
  }

  @Patch()
  async updateFileSystem(@Body() body: UpdateFolderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const promises = body.id.map(async (id, index) => {
        const payload: Record<string, any> = { userId: body.userId }; // 기본적으로 `userId`는 항상 포함

        if (body.id && body.id[index]) {
          payload.id = body.id[index];
        }

        if (body.name) {
          payload.name = body.name;
        }

        if ('isStarred' in body) {
          payload.isStarred = body.isStarred;
        }

        if (body.parentId) {
          payload.parentId = body.parentId;
        }

        payload.queryRunner = queryRunner;
        const pipeline = await asyncPipe(
          this.driveReadService.findFileSystem.bind(this.driveReadService),
          this.driveUpdateService.updateName.bind(this.driveUpdateService),
          this.driveUpdateService.updateIsStarred.bind(this.driveUpdateService),
          this.driveUpdateService.updatePath.bind(this.driveUpdateService),
          this.driveUpdateService.updateFileSystem.bind(this.driveUpdateService),
        );
        return await pipeline(payload);
      });
      const result = await Promise.all(promises);
      if (body.parentId && body.currentId) {
        await this.driveUpdateService.increaseCount(body.parentId, body.userId, body.id.length, queryRunner);
        await this.driveUpdateService.decreaseCount(body.currentId, body.userId, body.id.length, queryRunner);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Body() body: DeleteFolderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let parentId: string | null = null;
    try {
      for (const id of body.ids) {
        const pipeline = await asyncPipe(
          this.driveReadService.findFileSystem.bind(this.driveReadService),
          this.driveDeleteService.softDeleteFile.bind(this.driveDeleteService),
        );
        parentId = await pipeline({ id, userId: body.userId });
      }
      await this.driveUpdateService.decreaseCount(parentId, body.userId, body.ids.length, queryRunner);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  @Delete('destroy')
  @Serialize(SignInResponseDto)
  async deleteCompletelyFile(@Body() body: DeleteFolderDto) {
    for (const id of body.ids) {
      await this.driveDeleteService.deleteCompletelyFile(id, body.userId);
    }
    return await this.userService.findUserByUserId({ userId: body.userId });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async destroyDeleteFile() {
    await this.driveDeleteService.cleanupSoftDeletedFiles();
  }

  @Patch('restore')
  @HttpCode(HttpStatus.OK)
  async restoreFile(@Body() body: DeleteFolderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let parentId: string | null = null;
    try {
      for (const id of body.ids) {
        parentId = (await this.driveUpdateService.restoreFile(id, body.userId, queryRunner)).parent.id;
      }
      await this.driveUpdateService.increaseCount(parentId, body.userId, body.ids.length, queryRunner);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  @UseInterceptors(AnyFilesInterceptor())
  @Post('file')
  @Serialize(CreateFileResponseDto)
  async createFile(
    @Body() createFilePayloadDto: CreateFilePayloadDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const fixedFiles = files.map((file) => ({
      ...file,
      originalname: Buffer.from(file.originalname, 'latin1').toString('utf-8'),
    }));

    return await this.driveCreateService.s3PutTransaction({ ...createFilePayloadDto, files: fixedFiles });
  }

  // TODO 파일 저장후 암호화 혹은 접근 제어 추가
  @Get('/download/:fileSystemId')
  async downloadSingleFile(@Param('fileSystemId') fileSystemId: string, @Body() body: { userId: string }) {
    const { fileSystem } = await this.driveReadService.findFileSystem({ id: fileSystemId, userId: body.userId });
    if (fileSystem.type === 'file') {
      return await this.s3Service.generatePresignedUrl(
        'tms-drive-user',
        (fileSystem as File).storage_path,
        fileSystem.name,
      );
    } else if (fileSystem.type === 'folder') {
      const job = await this.driveReadService.addDownloadQueue(fileSystemId, body.userId);
      return { jobId: job.id };
    }
  }

  @Get('/download')
  async downloadMultipleFiles(
    @Query('fileSystemIds') fileSystemIds: string[],
    @Query('types') types: ['folder' | 'file'],
    @Body() body: { userId: string },
  ) {
    return this.driveReadService.addDownloadMultipleQueue(fileSystemIds, types, body.userId);
  }

  @Get('/status/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const result = await this.driveReadService.getDownloadStatus(jobId);
    if (!result) {
      return { error: 'Job not found' };
    }
    const { state } = result;
    if (state === 'completed') {
      const { bucket, key } = result.data;
      return await this.s3Service.generatePresignedUrl(bucket, key);
    }
    return { status: state };
  }

  // TODO S3와 DB 동기화 작업
  // 정합성 검사
  // @Cron('0 3 * * *')
  // async reconcileOrphanedFiles() {
  //   const s3Objects = await this.listAllS3Objects();
  //   const dbRecords = await this.fileRepository.find({ select: ['s3Key'] });
  //
  //   const dbKeys = new Set(dbRecords.map(r => r.s3Key));
  //   const orphaned = s3Objects.filter(key => !dbKeys.has(key));
  //
  //   if (orphaned.length > 0) {
  //     await this.s3Service.batchDelete(orphaned);
  //   }
  // }
}
