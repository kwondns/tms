import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAlarm } from '@/myleisure/entities/user/userAlarm.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Alarm } from '@/myleisure/entities/user/alarm.entity';
import { ReadNotificationType } from '@/myleisure/notification/types/notificationType';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(UserAlarm) private readonly userAlarmRepo: Repository<UserAlarm>,
    @InjectRepository(Alarm) private readonly alarmRepo: Repository<Alarm>,
    @InjectRepository(UserAuth) private readonly userAuthRepo: Repository<UserAuth>,
  ) {}

  async createUserAlarmRead(payload: ReadNotificationType) {
    const newUserAlarm = this.userAlarmRepo.create(payload);
    return this.userAlarmRepo.save(newUserAlarm);
  }

  async getUserAlarmRead(user_id: string) {
    const result = await this.userAlarmRepo.find({ where: { user_id }, select: { alarm_id: true } });
    return result.map((item) => item.alarm_id);
  }

  async getAlarmAfterUserCreated(userCreatedAt: Date) {
    return this.alarmRepo.find({
      where: { created_at: MoreThanOrEqual(userCreatedAt) },
      order: { created_at: 'desc' },
      take: 20,
    });
  }

  async getUserCreatedAt(user_id: string) {
    return this.userAuthRepo.findOneOrFail({ where: { user_id }, select: { created_at: true } });
  }
}
