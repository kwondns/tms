import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { NotificationService } from '@/myleisure/notification/notification.service';
import { Public } from '@/decorators/public.decorator';
import { Response } from 'express';

@Controller('/myleisure/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @Get()
  async getNotification(@Param() payload: { userId: string }, @Res() res: Response) {
    if (payload.userId === 'undefined' || !payload.userId) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
    return res.status(200).send(await this.notificationService.getUserAlarmWithReadList({ user_id: payload.userId }));
  }

  @HttpCode(204)
  @Post()
  async postReadNotification(@Body() payload: { userId: string; alarmId: number }) {
    await this.notificationService.postNewUserAlarmRead({ user_id: payload.userId, alarm_id: payload.alarmId });
  }
}
