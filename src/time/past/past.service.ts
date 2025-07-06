import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Past } from '@/time/entities/past.entity';
import { Between, Repository } from 'typeorm';
import { PastDto } from '@/time/dtos/past.dto';
import { Cron } from '@nestjs/schedule';
import { PastCount, PastCountView } from '@/time/entities/pastCount.entity';
import { UploadService } from '@/upload/upload.service';

@Injectable()
export class PastService {
  constructor(
    @InjectRepository(Past) private pastRepo: Repository<Past>,
    @InjectRepository(PastCount) private pastCountRepo: Repository<PastCount>,
    @InjectRepository(PastCountView) private pastCountViewRepo: Repository<PastCountView>,
    private uploadService: UploadService,
  ) {}

  async getPastDay(date: string) {
    return this.pastRepo.find({
      where: {
        startTime: Between(new Date(date), new Date(new Date(date).getTime() + 60 * 1000 * 60 * 24 - 1)),
      },
      order: { created_at: 'asc' },
    });
  }

  async updatePast(id: string, body: PastDto) {
    const past = await this.pastRepo.findOneBy({ id });
    if (!past) throw new NotFoundException('잘못된 과거입니다!');
    Object.assign(past, body);
    return this.pastRepo.save(past);
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
    const result = await this.pastCountViewRepo
      .createQueryBuilder('view')
      .select(['id', "TO_CHAR(date, 'YYYY-MM-DD') as date", 'count', 'titles', 'titles_count'])
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();
    return result.reverse();
  }

  async getCalendarPast(date: string) {
    const startDate = new Date(new Date(date).getTime() + 60 * 1000 * 60 * 9);
    const endDate = new Date(new Date(date).getTime() + 60 * 1000 * 60 * 24 * 42 + 60 * 1000 * 60 * 9);
    return await this.pastCountViewRepo
      .createQueryBuilder('view')
      .where('view.date >= :startDate', { startDate })
      .andWhere('view.date < :endDate', { endDate })
      .orderBy('date', 'ASC')
      .limit(42)
      .getMany();
  }

  async cleanUpImage(startTime: string) {
    const imageList = await this.uploadService.objectList('time', startTime);
    if (!imageList.Contents || imageList.Contents.length === 0) return false;

    const past = await this.pastRepo.findOneBy({ startTime: new Date(startTime) });
    const cleanTargets = imageList.Contents.filter((image) => !past.content.includes(image.Key)).map((key) => key.Key);
    if (cleanTargets.length === 0) return false;

    const cleanResult = await this.uploadService.deleteHandler('time', cleanTargets);
    return cleanResult.Deleted.length;
  }
}
