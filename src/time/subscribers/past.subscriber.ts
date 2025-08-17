import { EntitySubscriberInterface, EventSubscriber, InsertEvent, TransactionCommitEvent, UpdateEvent } from 'typeorm';
import { Past } from '@/time/entities/past.entity';
import { PastCount } from '@/time/entities/pastCount.entity';
import { Present } from '@/time/entities/present.entity';
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
    let pastCount = await event.queryRunner.manager
      .createQueryBuilder(PastCount, 'pc')
      .where('pc.date::date = :startTime AND pc.user_id = :userId', {
        startTime: new Date(event.entity.startTime)
          .toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replaceAll('. ', '-')
          .replaceAll('.', ''),
        userId: event.entity.user.user_id,
      })
      .getOne();

    if (!pastCount) {
      const newPastCount = event.queryRunner.manager.getRepository(PastCount).create({
        date: event.entity.startTime,
        count: 0,
        user: event.entity.user,
      });
      pastCount = await event.queryRunner.manager.getRepository(PastCount).save(newPastCount);
    }
    pastCount.count += diffMinute;
    await event.queryRunner.manager.save(PastCount, pastCount);
    event.queryRunner.data.entity = 'past';
    pastCount.count += diffMinute;

    const present = await event.queryRunner.manager.findOne(Present, {
      where: { user: { user_id: event.entity.user.user_id } },
    });
    present.startTime = null;
    present.endTime = null;
    present.title = null;
    present.content = null;
    await Promise.all([event.queryRunner.manager.save(PastCount, pastCount), event.queryRunner.manager.save(present)]);
    event.queryRunner.data.entity = 'past';
    event.queryRunner.data.userId = event.entity.user.user_id;
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
      .where('pc.date::date = :startTime AND pc.user_id = :userId', {
        startTime: new Date(event.entity.startTime)
          .toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replaceAll('. ', '-')
          .replaceAll('.', ''),
        userId: event.entity.user.user_id,
      })
      .getOne();
    pastCount.count -= beforeDiffMinute;
    pastCount.count += diffMinute;
    await Promise.all([event.queryRunner.manager.save(PastCount, pastCount)]);
    event.queryRunner.data.entity = 'past';
    event.queryRunner.data.userId = event.entity.user.user_id;
  }
  async afterTransactionCommit(event: TransactionCommitEvent) {
    if (event.queryRunner.data?.entity !== 'past') return;
    await axios.post(`${process.env.CHATBOT_URL}embedding`, { userId: event.queryRunner.data.userId });
    delete event.queryRunner.data.entity;
  }
}
