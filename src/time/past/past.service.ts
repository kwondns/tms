import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Past } from '@/time/entities/past.entity';
import { Between, DataSource, Repository } from 'typeorm';
import { PastCreateDto, PastUpdateDto } from '@/time/dtos/past.dto';
import { Cron } from '@nestjs/schedule';
import { PastCount, PastCountView } from '@/time/entities/pastCount.entity';
import { UploadService } from '@/upload/upload.service';
import { User } from '@/time/user/entities/user.entity';
import AppConfig from '@/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PastService {
  constructor(
    @InjectRepository(Past) private readonly pastRepo: Repository<Past>,
    @InjectRepository(PastCount) private readonly pastCountRepo: Repository<PastCount>,
    @InjectRepository(PastCountView) private readonly pastCountViewRepo: Repository<PastCountView>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  async getPastDay({ user, date }: { user: User; date: string }) {
    const start = new Date(`${date}T00:00:00+09:00`);
    const endDate = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return await this.pastRepo.find({
      where: {
        startTime: Between(start, endDate),
        user: { user_id: user.user_id },
      },
      order: { created_at: 'asc' },
    });
  }

  async updatePast(body: PastUpdateDto) {
    const { id, user, ...others } = body;
    const past = await this.pastRepo.findOne({ where: { id, user: { user_id: user.user_id } } });
    if (!past) throw new NotFoundException('잘못된 과거입니다!');
    Object.assign(past, others);
    return this.pastRepo.save(past);
  }

  async createPast(body: PastCreateDto) {
    const past = this.pastRepo.create(body);
    return this.pastRepo.save(past);
  }

  // ! TODO 사용자 별 생성대신 Past Insert, Update 에 따라 생성하게
  // ! 그 후 데이터 패칭시에 빈 날짜의 데이터를 채워 넣는 형태로
  // ! 임시로 모든 유저의 ID로 생성하는 형태
  @Cron('0 0 0 * * *', {
    name: 'createPastCount',
    timeZone: 'Asia/Seoul',
  })
  async createPastCount() {
    const kstDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const userIds = await this.userRepository.find({ select: ['user_id'] });
    for (const user of userIds) {
      const pastCount = this.pastCountRepo.create({
        date: kstDate,
        count: 0,
        user: user,
      });
      await this.pastCountRepo.save(pastCount);
    }
    console.log(`${userIds.length} users past count created`);
  }

  async getMonthPast({ user }: { user: User }) {
    const result = await this.pastCountViewRepo
      .createQueryBuilder('view')
      .select(['id', "TO_CHAR(date, 'YYYY-MM-DD') as date", 'count', 'titles', 'titles_count::int'])
      .where('view.user_id = :userId', { userId: user.user_id })
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();
    return result.reverse();
  }

  async getCalendarPast({ user, date }: { user: User; date: string }) {
    function getCalendarStartEndDates(year, month) {
      const firstDay = new Date(year, month - 1, 1);

      const startDayOfWeek = firstDay.getDay();

      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - startDayOfWeek);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 41);

      return { startDate, endDate };
    }
    const { startDate, endDate } = getCalendarStartEndDates(date.split('-')[0], date.split('-')[1]);
    return await this.pastCountViewRepo
      .createQueryBuilder('view')
      .where('view.date >= :startDate', { startDate })
      .andWhere('view.user_id = :userId', { userId: user.user_id })
      .andWhere('view.date < :endDate', { endDate })
      .orderBy('date', 'ASC')
      .limit(42)
      .getMany();
  }

  async cleanUpImage(startTime: string) {
    const imageList = await this.uploadService.objectList('timeline', startTime);
    if (!imageList.Contents || imageList.Contents.length === 0) return false;

    const past = await this.pastRepo.findOneBy({ startTime: new Date(startTime) });
    const cleanTargets = imageList.Contents.filter((image) => !past.content.includes(image.Key)).map((key) => key.Key);
    if (cleanTargets.length === 0) return false;

    const cleanResult = await this.uploadService.deleteHandler('time', cleanTargets);
    return cleanResult.Deleted.length;
  }

  // Demo 계정에 데이터 추가
  // Past Count는 Subscriber에서 생성되도록 작성
  @Cron('0 3 0 * * *', {
    name: 'duplicateDemoPast',
    timeZone: 'Asia/Seoul',
  })
  async duplicateDemoPast() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const yesterdayStart = new Date();

      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setDate(yesterdayStart.getDate() + 1);
      console.log(`duplicateDemoPast: from ${yesterdayStart}, to ${yesterdayEnd}`);

      const sourceRows = await this.pastRepo.find({
        where: {
          user: { user_id: this.config.timeline.userId },
          startTime: Between(yesterdayStart, yesterdayEnd),
        },
      });
      for (const row of sourceRows) {
        const demoEntity = this.pastRepo.create({
          ...row,
          id: undefined,
          user: { user_id: this.config.timeline.demoUserId },
        });
        await this.pastRepo.save(demoEntity);
      }
      console.log(sourceRows.length, 'rows duplicated');
      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
