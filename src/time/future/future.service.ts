import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Future, FutureCheck, FutureProgress } from '@/time/entities/future.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { FutureBox, FutureBoxProgressView } from '@/time/entities/futureBox.entity';
import { FutureBoxDto } from '@/time/dtos/futureBox.dto';
import { FutureCreateServiceDto } from '@/time/dtos/futureCreate.dto';
import { FutureBoxCreateServiceDto } from '@/time/dtos/futureBoxCreate.dto';
import { User } from '@/time/user/entities/user.entity';
import { FuturePatchDto } from '@/time/dtos/futurePatch.dto';
import AppConfig from '@/app.config';
import { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class FutureService {
  constructor(
    @InjectRepository(Future) private readonly futureRepo: Repository<Future>,
    @InjectRepository(FutureBox) private readonly futureBoxRepo: Repository<FutureBox>,
    @InjectRepository(FutureBoxProgressView)
    private readonly futureBoxProgressViewRepo: Repository<FutureBoxProgressView>,
    private readonly dataSource: DataSource,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  async getFutureBox({ user }: { user: User }) {
    return this.futureBoxRepo
      .createQueryBuilder('future_box')
      .leftJoinAndSelect('future_box.future', 'future')
      .where('future_box.user = :userId', { userId: user.user_id })
      .andWhere('future_box.checked = :checked', { checked: false })
      .andWhere(
        new Brackets((qb) => {
          qb.where('future.type = :checkType AND future.checked = :futureChecked And future.user_id = :userId', {
            checkType: 'FutureCheck',
            futureChecked: false,
            userId: user.user_id,
          })
            .orWhere('future.type = :progressType AND future.percentage < :maxPercentage', {
              progressType: 'FutureProgress',
              maxPercentage: 100,
            })
            .orWhere('future.id IS NULL');
        }),
      )
      .orderBy('future_box.order', 'DESC')
      .getMany();
  }

  async getFutureBoxRecord() {
    return this.futureBoxRepo.find({ relations: ['future'] });
  }

  async findOneFutureBox(user_id: string, id: string) {
    return this.futureBoxRepo.findOneBy({ id, user: { user_id: user_id } });
  }

  async patchFuture(dto: FuturePatchDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { user, ...others } = dto;
    const future = await this.futureRepo.findOneBy({ id: others.id, user: { user_id: user.user_id } });
    if (!future) throw new NotFoundException('없는 미래입니다!');
    try {
      Object.assign(future, others);
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

  async createFuture(dto: FutureCreateServiceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const futureBox = await this.findOneFutureBox(dto.user.user_id, dto.boxId);
    if (!futureBox) throw new NotFoundException('없는 박스입니다!');
    try {
      const future = queryRunner.manager.getRepository('future').create(dto);
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

  async createFutureBox(dto: FutureBoxCreateServiceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const futureBox = queryRunner.manager.getRepository('future_box').create(dto);
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

  async getFutureAnalysis({ user }: { user: User }) {
    const futureBoxes = await this.futureBoxProgressViewRepo.find({
      where: { checked: false, user_id: user.user_id },
      order: { updated_at: 'DESC' },
    });

    const getLastCompletedFuture = (futureBox: FutureBoxProgressView) => {
      const statusWhere = futureBox.type === 'check' ? { checked: true } : { percentage: 100 };
      return this.futureRepo.find({
        where: { future_box: { id: futureBox.id }, user: { user_id: user.user_id }, ...statusWhere },
        order: { updated_at: 'DESC' },
        take: 3,
      });
    };

    return await Promise.all(
      futureBoxes.map(async (futureBox) => ({
        ...futureBox,
        lastCompletedFuture: await getLastCompletedFuture(futureBox),
      })),
    );
  }
  // Demo 계정에 데이터 추가
  // Future의 상태가 변동 가능하여 모든 Future를 비교 후 업데이트 보다 일괄 삭제 후 일괄 생성을 선택
  @Cron('0 1 0 * * *', {
    name: 'duplicateDemoFutureAndBox',
    timeZone: 'Asia/Seoul',
  })
  async duplicateDemoFutureAndBox() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Future, { user: { user_id: this.config.timeline.demoUserId } });
      await queryRunner.manager.delete(FutureBox, { user: { user_id: this.config.timeline.demoUserId } });
      const boxes = await queryRunner.manager.find(FutureBox, {
        where: { user: { user_id: this.config.timeline.userId } },
      });
      const idMap = new Map<string, string>();
      for (const b of boxes) {
        const demo = queryRunner.manager.create(FutureBox, {
          ...b,
          id: undefined,
          user: { user_id: this.config.timeline.demoUserId },
        });
        const saved = await queryRunner.manager.save(demo);
        idMap.set(b.id, saved.id);
      }

      // 4) 실제 Future 복제
      const futures = await queryRunner.manager.find(Future, {
        where: { user: { user_id: this.config.timeline.userId } },
        relations: ['future_box'],
      });
      for (const f of futures) {
        if (!f.future_box) {
          console.warn(`Future ${f.id} has no future_box`);
          continue;
        }

        const newBoxId = idMap.get(f.future_box.id);
        if (!newBoxId) {
          console.warn(`No mapping found for future_box.id: ${f.future_box.id}`);
          continue;
        }

        const demo = queryRunner.manager.create(Future, {
          ...f,
          id: undefined,
          user: { user_id: this.config.timeline.demoUserId },
          future_box: { id: newBoxId },
        });
        // child entity fields
        if (f instanceof FutureCheck) demo['checked'] = f['checked'];
        if (f instanceof FutureProgress) demo['percentage'] = f['percentage'];
        await queryRunner.manager.save(demo);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      console.error(`Duplicating Future Failed: ${e}`);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
