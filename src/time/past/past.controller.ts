import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PastDto } from '@/time/dtos/past.dto';
import { Public } from '@/decorators/public.decorator';
import { PastService } from '@/time/past/past.service';

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

  @Put(':id')
  async updatePastDay(@Param('id') id: string, @Body() body: PastDto) {
    return this.pastService.updatePast(id, body);
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

  @Public()
  @Get('/cleanup/:startTime')
  async cleanUpImages(@Param('startTime') startTime: string) {
    return await this.pastService.cleanUpImage(startTime);
  }
}
