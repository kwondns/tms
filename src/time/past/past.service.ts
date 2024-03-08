import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Past } from '../entities/past.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { PastDto } from '../dtos/past.dto';
import { Cron } from '@nestjs/schedule';
import { PastCount, PastCountView } from '../entities/pastCount.entity';

@Injectable()
export class PastService {
  constructor(
    @InjectRepository(Past) private pastRepo: Repository<Past>,
    @InjectRepository(PastCount) private pastCountRepo: Repository<PastCount>,
    @InjectRepository(PastCountView) private pastCountViewRepo: Repository<PastCountView>,
  ) {}

  async getPastDay(date: string) {
    return this.pastRepo.find({
      where: {
        startTime: MoreThanOrEqual(new Date(date)),
        endTime: LessThanOrEqual(new Date(new Date(date).getTime() + 60 * 1000 * 60 * 24 - 1)),
      },
      order: { created_at: 'asc' },
    });
  }

  async createPast(body: PastDto) {
    const past = this.pastRepo.create(body);
    return this.pastRepo.save(past);
  }

  @Cron('0 0 0 * * *', {
    name: 'createPastCount',
    timeZone: 'Asia/Seoul',
  })
  createPastCount() {
    const date = new Date();
    const pastCount = this.pastCountRepo.create({
      date: date,
      count: 0,
    });
    return this.pastCountRepo.save(pastCount);
  }

  async getMonthPast() {
    return await this.pastCountViewRepo.find({ order: { date: 'desc' }, take: 30 });
  }

  async getCalendarPast(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(new Date(date).getTime() + 60 * 1000 * 60 * 24 * 42);
    return await this.pastCountViewRepo
      .createQueryBuilder('view')
      .where('view.date > :startDate', { startDate })
      .andWhere('view.date < :endDate', { endDate })
      .orderBy('date', 'DESC')
      .limit(42)
      .getMany();
  }
}
