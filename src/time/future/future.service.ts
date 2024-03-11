import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Future } from '../entities/future.entity';
import { Repository } from 'typeorm';
import { FutureBox } from '../entities/futureBox.entity';
import { FutureDto } from '../dtos/future.dto';
import { FutureBoxDto } from '../dtos/futureBox.dto';
import { FutureCreateDto } from '../dtos/futureCreate.dto';
import { FutureBoxCreateDto } from '../dtos/futureBoxCreate.dto';

@Injectable()
export class FutureService {
  constructor(
    @InjectRepository(Future) private futureRepo: Repository<Future>,
    @InjectRepository(FutureBox) private futureBoxRepo: Repository<FutureBox>,
  ) {}

  async getFutureBox(priority: number) {
    return this.futureBoxRepo.find({ where: { priority }, relations: ['future'] });
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
