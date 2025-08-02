import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Future, FutureCheck, FutureProgress } from '@/time/entities/future.entity';
import { DataSource, Repository } from 'typeorm';
import { FutureBox } from '@/time/entities/futureBox.entity';
import { FutureDto } from '@/time/dtos/future.dto';
import { FutureBoxDto } from '@/time/dtos/futureBox.dto';
import { FutureCreateDto } from '@/time/dtos/futureCreate.dto';
import { FutureBoxCreateDto } from '@/time/dtos/futureBoxCreate.dto';

@Injectable()
export class FutureService {
  constructor(
    @InjectRepository(Future) private readonly futureRepo: Repository<Future>,
    @InjectRepository(FutureBox) private readonly futureBoxRepo: Repository<FutureBox>,
    private readonly dataSource: DataSource,
  ) {}

  async getFutureBox() {
    return this.futureBoxRepo.find({
      where: { checked: false },
      order: { order: 'DESC' },
      relations: ['future'],
    });
  }

  async getFutureBoxRecord() {
    return this.futureBoxRepo.find({ relations: ['future'] });
  }

  async findOneFutureBox(id: string) {
    return this.futureBoxRepo.findOneBy({ id });
  }

  async patchFuture(attrs: FutureDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const future = await this.futureRepo.findOneBy({ id: attrs.id });
    if (!future) throw new NotFoundException('없는 미래입니다!');
    try {
      Object.assign(future, attrs);
      const newFuture = this.futureRepo.save(future);
      await queryRunner.commitTransaction();
      return newFuture;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(e);
    } finally {
      await queryRunner.release();
    }
  }

  async createFuture(attrs: FutureCreateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const futureBox = await this.findOneFutureBox(attrs.boxId);
    if (!futureBox) throw new NotFoundException('없는 박스입니다!');
    try {
      const future = queryRunner.manager.getRepository('future').create(attrs);
      future.future_box = futureBox;
      let targetRepository: typeof FutureCheck | typeof FutureProgress;
      if (futureBox.type === 'check') targetRepository = FutureCheck;
      else if (futureBox.type === 'progress') targetRepository = FutureProgress;
      const newFuture = await queryRunner.manager.getRepository(targetRepository).save(future);
      await queryRunner.commitTransaction();
      return newFuture;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(e);
    } finally {
      await queryRunner.release();
    }
  }

  async patchFutureBox(attrs: FutureBoxDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const futureBox = await this.futureBoxRepo.findOneBy({ id: attrs.id });
    if (!futureBox) throw new NotFoundException('없는 박스입니다!');
    try {
      Object.assign(futureBox, attrs);
      const newFutureBox = this.futureBoxRepo.save(futureBox);
      await queryRunner.commitTransaction();
      return newFutureBox;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(e);
    } finally {
      await queryRunner.release();
    }
  }

  async createFutureBox(attrs: FutureBoxCreateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const futureBox = queryRunner.manager.getRepository('future_box').create(attrs);
      const newFutureBox = await queryRunner.manager.getRepository('future_box').save(futureBox);
      await queryRunner.commitTransaction();
      return newFutureBox;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(e);
    } finally {
      await queryRunner.release();
    }
  }
}
