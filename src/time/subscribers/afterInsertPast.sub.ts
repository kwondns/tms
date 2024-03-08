import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Past } from '../entities/past.entity';
import { PastCount } from '../entities/pastCount.entity';
import { Present } from '../entities/present.entity';

@EventSubscriber()
export class AfterInsertPastSub implements EntitySubscriberInterface<Past> {
  listenTo(): any {
    return Past;
  }

  async afterInsert(event: InsertEvent<Past>) {
    await event.queryRunner.startTransaction();
    try {
      const diffMinute =
        (new Date(event.entity.endTime).getTime() - new Date(event.entity.startTime).getTime()) / 60 / 1000;
      const pastCount = await event.queryRunner.manager
        .createQueryBuilder(PastCount, 'pc')
        .where('pc.date::date = :startTime', { startTime: new Date(event.entity.startTime).toDateString() })
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
}
