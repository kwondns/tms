import { BadRequestException, Injectable } from '@nestjs/common';
import { ReadNotificationType } from '@/myleisure/notification/types/notificationType';
import { NotificationRepository } from '@/myleisure/notification/notification.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async postNewUserAlarmRead(payload: ReadNotificationType) {
    try {
      return await this.notificationRepository.createUserAlarmRead(payload);
    } catch (e) {
      throw new BadRequestException('notification.controller.postNewUserAlarmRead');
    }
  }

  async getUserAlarmWithReadList(payload: { user_id: string }) {
    try {
      const [userReadAlarmList, userCreatedAt] = await Promise.all([
        this.notificationRepository.getUserAlarmRead(payload.user_id),
        this.notificationRepository.getUserCreatedAt(payload.user_id),
      ]);
      const alarmList = await this.notificationRepository.getAlarmAfterUserCreated(userCreatedAt.created_at);
      const transformAlarmListColumn = alarmList.map((item) => ({
        id: item.id,
        boardId: item.board_id,
        category: item.category,
        message: item.message,
        createdAt: item.created_at,
      }));
      return { userReadAlarmList, alarmList: transformAlarmListColumn };
    } catch (e) {
      throw new BadRequestException('notification.controller.postNewUserAlarmRead');
    }
  }
}
