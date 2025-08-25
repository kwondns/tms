import { EntitySubscriberInterface, EventSubscriber, InsertEvent, TransactionCommitEvent, UpdateEvent } from 'typeorm';
import { Past } from '@/time/entities/legacy/past.legacy.entity';
import { PastCount } from '@/time/entities/legacy/pastCount.legacy.entity';
import { Present } from '@/time/entities/legacy/present.legacy.entity';
import axios from 'axios';

@EventSubscriber()
export class PastSubscriber implements EntitySubscriberInterface<Past> {
  listenTo(): any {
    return Past;
  }

  async afterInsert(event: InsertEvent<Past>) {
    const diffMinute = Math.floor(
      (new Date(event.entity.endTime).getTime() - new Date(event.entity.startTime).getTime()) / 60 / 1000,
    );
    const pastCount = await event.queryRunner.manager
      .createQueryBuilder(PastCount, 'pc')
      .where('pc.date::date = :startTime', {
        startTime: new Date(event.entity.startTime)
          .toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replaceAll('. ', '-')
          .replaceAll('.', ''),
      })
      .getOne();
    pastCount.count += diffMinute;

    const present = await event.queryRunner.manager.findOne(Present, { where: { id: 1 } });
    present.startTime = null;
    present.endTime = null;
    present.title = null;
    present.content = null;
    await Promise.all([event.queryRunner.manager.save(PastCount, pastCount), event.queryRunner.manager.save(present)]);
    event.queryRunner.data.entity = 'past-legacy';
  }

  async afterUpdate(event: UpdateEvent<Past>) {
    const diffMinute =
      (new Date(event.entity.endTime).getTime() - new Date(event.entity.startTime).getTime()) / 60 / 1000;

    const beforeDiffMinute =
      (new Date(event.databaseEntity.endTime).getTime() - new Date(event.databaseEntity.startTime).getTime()) /
      60 /
      1000;
    const pastCount = await event.queryRunner.manager
      .createQueryBuilder(PastCount, 'pc')
      .where('pc.date::date = :startTime', {
        startTime: new Date(event.entity.startTime)
          .toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replaceAll('. ', '-')
          .replaceAll('.', ''),
      })
      .getOne();
    pastCount.count -= beforeDiffMinute;
    pastCount.count += diffMinute;
    await Promise.all([event.queryRunner.manager.save(PastCount, pastCount)]);
    event.queryRunner.data.entity = 'past-legacy';
  }
  async afterTransactionCommit(event: TransactionCommitEvent) {
    if (event.queryRunner.data?.entity !== 'past-legacy') return;
    await axios.post(`${process.env.CHATBOT_URL}embedding`);
    delete event.queryRunner.data.entity;
  }
}
