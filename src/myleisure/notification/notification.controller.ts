import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { NotificationService } from '@/myleisure/notification/notification.service';
import { Public } from '@/decorators/public.decorator';

@Controller('/myleisure/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @Get()
  async getNotification(@Param() payload: { userId: string }) {
    if (payload.userId === 'undefined' || !payload.userId) return { status: 204, data: { authNeed: true } };
    return await this.notificationService.getUserAlarmWithReadList({ user_id: payload.userId });
  }

  @HttpCode(204)
  @Post()
  async postReadNotification(@Body() payload: { userId: string; alarmId: number }) {
    await this.notificationService.postNewUserAlarmRead({ user_id: payload.userId, alarm_id: payload.alarmId });
  }
}
