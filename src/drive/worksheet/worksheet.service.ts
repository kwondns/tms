import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorksheetDto } from '@/drive/worksheet/dto/create-worksheet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { Worksheet } from '@/drive/worksheet/entities/worksheet.entity';
import { User } from '@/drive/user/entities/user.entity';
import { FindWorksheetDto } from '@/drive/worksheet/dto/find-worksheet.dto';
import asyncPipe from '@/utils/asyncPipe';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { PermissionService } from '@/drive/permission/permission.service';

@Injectable()
export class WorksheetService {
  constructor(
    @InjectRepository(Worksheet) private readonly worksheetRepo: Repository<Worksheet>,
    private readonly driveCreateService: DriveCreateService,
    private readonly driveReadService: DriveReadService,
    private readonly permissionService: PermissionService,
    private readonly dataSource: DataSource,
  ) {}

  async createNewWorksheetInTransaction(queryRunner: QueryRunner, createWorksheetDto: CreateWorksheetDto, user: User) {
    return queryRunner.manager.getRepository(Worksheet).create({ ...createWorksheetDto, updated_at: new Date(), user });
  }

  async saveWorksheetInTransaction(queryRunner: QueryRunner, parentId: string, worksheet: Worksheet) {
    const savedWorksheet = await queryRunner.manager.getRepository(Worksheet).save(worksheet);
    return {
      worksheet: savedWorksheet,
      userId: worksheet.user.user_id,
      name: worksheet.name,
      parentId,
    };
  }

  async createWorksheetAndDrive(createWorksheetDto: CreateWorksheetDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pipeline = await asyncPipe(
        this.driveCreateService.checkAlreadyExistNameAndMakeUnique.bind(this.driveCreateService, 'worksheet'),
        this.createNewWorksheetInTransaction.bind(this, queryRunner, createWorksheetDto, user),
        this.saveWorksheetInTransaction.bind(this, queryRunner, createWorksheetDto.parentId),
        this.driveReadService.findUserAndPass.bind(this.driveReadService),
        this.driveCreateService.newFileSystem.bind(this.driveCreateService, queryRunner, 'worksheet'),
        this.driveCreateService.saveFileSystem.bind(this.driveCreateService, queryRunner),
        this.permissionService.newPermission.bind(this.permissionService, queryRunner, 'OWNER'),
      );
      const result = await pipeline(createWorksheetDto);
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  async createQueryBuilderFilter(queryBuilder: SelectQueryBuilder<Worksheet>, name, condition) {
    queryBuilder.andWhere(`worksheet.${name} = :${name}`, { [name]: condition });
  }

  async createQueryBuilderLikeFilter(queryBuilder: SelectQueryBuilder<Worksheet>, name, condition) {
    queryBuilder.andWhere(`worksheet.${name} LIKE :${name}`, { [name]: `%${condition}%` });
  }

  async getWorksheet(worksheet_id: string) {
    return await this.worksheetRepo.findOne({ where: { worksheet_id: worksheet_id }, relations: ['user', 'trash'] });
  }

  async checkWorksheetOwner(userId: string, worksheet: Worksheet) {
    if (worksheet.user.user_id === userId) return worksheet;
    throw new BadRequestException('잘못된 요청입니다.');
  }

  async findWithFilter(findWorksheetDto: FindWorksheetDto, user: User) {
    const { page, ...filter } = findWorksheetDto;
    const queryBuilder = this.worksheetRepo
      .createQueryBuilder('worksheet')
      .leftJoinAndSelect('worksheet.worksheet_file_system', 'worksheet_file_system')
      .leftJoinAndSelect('worksheet_file_system.parent', 'parent')
      .where('worksheet.user_id= :userId', { userId: user.user_id }); // 특정 사용자 ID로 필터링

    // 동적 필터 추가
    if (filter.gender) {
      await this.createQueryBuilderFilter(queryBuilder, 'gender', filter.gender);
    }
    if (filter.category) {
      await this.createQueryBuilderFilter(queryBuilder, 'category', filter.category);
    }
    if (filter.clothes) {
      await this.createQueryBuilderLikeFilter(queryBuilder, 'clothes', filter.clothes);
    }
    if (filter.name) {
      await this.createQueryBuilderLikeFilter(queryBuilder, 'name', filter.name);
    }

    queryBuilder.skip((page - 1) * 30);
    queryBuilder.take(30);
    queryBuilder.orderBy('worksheet.updated_at', 'DESC');

    const [data, count] = await queryBuilder.getManyAndCount();
    return { data, count };
  }

  async updateWorksheet(updateValue: Partial<Worksheet>, worksheet: Worksheet) {
    worksheet = { ...worksheet, ...updateValue };
    if (updateValue.name) worksheet.worksheet_file_system.name = updateValue.name;
    return worksheet;
  }

  async saveWorksheet(worksheet: Worksheet) {
    return this.worksheetRepo.save(worksheet);
  }
}
