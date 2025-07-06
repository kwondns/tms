import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Past } from '@/time/entities/past.entity';
import { PastCount } from '@/time/entities/pastCount.entity';
import { Present } from '@/time/entities/present.entity';

@EventSubscriber()
export class PastSubscriber implements EntitySubscriberInterface<Past> {
  listenTo(): any {
    return Past;
  }

  async afterInsert(event: InsertEvent<Past>) {
    await event.queryRunner.startTransaction();
    try {
      const diffMinute = Math.floor(
        (new Date(event.entity.endTime).getTime() - new Date(event.entity.startTime).getTime()) / 60 / 1000,
      );
      const pastCount = await event.queryRunner.manager
        .createQueryBuilder(PastCount, 'pc')
        .where('pc.date::date = :startTime', {
          startTime: new Date(event.entity.startTime)
            .toLocaleDateString('ko-KR', {
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
      await Promise.all([
        event.queryRunner.manager.save(PastCount, pastCount),
        event.queryRunner.manager.save(present),
      ]);

      await event.queryRunner.commitTransaction();
    } catch (e) {
      await event.queryRunner.rollbackTransaction();
    }
  }

  async afterUpdate(event: UpdateEvent<Past>) {
    await event.queryRunner.startTransaction();
    try {
      const diffMinute =
        (new Date(event.entity.endTime).getTime() - new Date(event.entity.startTime).getTime()) / 60 / 1000;

      const beforeDiffMinute =
        (new Date(event.databaseEntity.endTime).getTime() - new Date(event.databaseEntity.startTime).getTime()) /
        60 /
        1000;
      const pastCount = await event.queryRunner.manager
        .createQueryBuilder(PastCount, 'pc')
        .where('pc.date::date = :startTime', { startTime: new Date(event.entity.startTime).toDateString() })
        .getOne();
      pastCount.count -= beforeDiffMinute;
      pastCount.count += diffMinute;
      await Promise.all([event.queryRunner.manager.save(PastCount, pastCount)]);

      await event.queryRunner.commitTransaction();
    } catch (e) {
      await event.queryRunner.rollbackTransaction();
    }
  }
}
