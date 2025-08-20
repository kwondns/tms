import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PastDto } from '@/time/dtos/legacy/past.legacy.dto';
import { Public } from '@/decorators/public.decorator';
import { PastLegacyService } from '@/time/past/legacy/past.legacy.service';

@Controller('/time/legacy/past')
export class PastLegacyController {
  constructor(private readonly pastService: PastLegacyService) {}
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
