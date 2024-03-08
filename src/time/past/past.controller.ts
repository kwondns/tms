import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PastDto } from '../dtos/past.dto';
import { Public } from '../../decorators/public.decorator';
import { PastService } from './past.service';

@Controller('/time/past')
export class PastController {
  constructor(private pastService: PastService) {}
  @Public()
  @Get('count')
  async getPastCount() {
    return await this.pastService.getMonthPast();
  }

  @Public()
  @Get(':date')
  async getPast(@Param('date') date: string) {
    return this.pastService.getPastDay(date);
  }

  @Post()
  async createPast(@Body() body: PastDto) {
    return this.pastService.createPast(body);
  }

  @Public()
  @Get('/calendar/:date')
  async getPastCalendar(@Param('date') date: string) {
    return await this.pastService.getCalendarPast(date);
  }
}
