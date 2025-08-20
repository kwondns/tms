import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Future } from '@/time/entities/legacy/future.legacy.entity';
import { Repository } from 'typeorm';
import { FutureBox } from '@/time/entities/legacy/futureBox.legacy.entity';
import { FutureDto } from '@/time/dtos/legacy/future.legacy.dto';
import { FutureBoxDto } from '@/time/dtos/legacy/futureBox.legacy.dto';
import { FutureCreateDto } from '@/time/dtos/legacy/futureCreate.legacy.dto';
import { FutureBoxCreateDto } from '@/time/dtos/legacy/futureBoxCreate.legacy.dto';

@Injectable()
export class FutureLegacyService {
  constructor(
    @InjectRepository(Future) private readonly futureRepo: Repository<Future>,
    @InjectRepository(FutureBox) private readonly futureBoxRepo: Repository<FutureBox>,
  ) {}

  async getFutureBox(priority: number) {
    return this.futureBoxRepo.find({
      where: { priority, checked: false },
      order: { order: 'DESC' },
      relations: ['future'],
    });
  }

  async getFutureBoxRecord(priority: number) {
    return this.futureBoxRepo.find({ where: { priority, checked: true }, relations: ['future'] });
  }

  async patchFuture(attrs: FutureDto) {
    const future = await this.futureRepo.findOneBy({ id: attrs.id });
    if (!future) throw new NotFoundException('없는 미래입니다!');
    Object.assign(future, attrs);
    return this.futureRepo.save(future);
  }

  async createFuture(attrs: FutureCreateDto) {
    const future = this.futureRepo.create(attrs);
    const futureBox = await this.futureBoxRepo.findOneBy({ id: attrs.boxId });
    if (!futureBox) throw new NotFoundException('없는 박스입니다!');
    future.box = futureBox;
    return this.futureRepo.save(future);
  }

  async patchFutureBox(attrs: FutureBoxDto) {
    const futureBox = await this.futureBoxRepo.findOneBy({ id: attrs.id });
    if (!futureBox) throw new NotFoundException('없는 박스입니다!');
    Object.assign(futureBox, attrs);
    return this.futureBoxRepo.save(futureBox);
  }

  async createFutureBox(attrs: FutureBoxCreateDto) {
    const futureBox = this.futureBoxRepo.create(attrs);
    return this.futureBoxRepo.save(futureBox);
  }
}
