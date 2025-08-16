import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Present } from '@/time/entities/present.entity';
import { DataSource, Repository } from 'typeorm';
import { PresentUpdateServiceDto } from '@/time/dtos/present.dto';
import { User } from '@/time/user/entities/user.entity';

@Injectable()
export class PresentService {
  constructor(
    @InjectRepository(Present) private readonly presentRepo: Repository<Present>,
    private readonly dataSource: DataSource,
  ) {}

  async getPresent({ user }: { user: User }) {
    try {
      return await this.presentRepo.findOneByOrFail({ user: { user_id: user.user_id } });
    } catch (e) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }
  }

  async storePresent(dto: Omit<PresentUpdateServiceDto, 'userId'>) {
    const { user, ...others } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const present = await this.getPresent({ user });
      Object.assign(present, others);
      // this.presentGateway.presentUpdate(present);
      const result = await this.presentRepo.save(present);
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(e);
    } finally {
      await queryRunner.release();
    }
  }

  async createPresent(user: User) {
    user.present = this.presentRepo.create();
    return user;
  }
}
