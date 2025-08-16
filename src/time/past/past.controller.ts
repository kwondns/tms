import { Body, Controller, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { PastDto } from '@/time/dtos/past.dto';
import { Public } from '@/decorators/public.decorator';
import { PastService } from '@/time/past/past.service';
import asyncPipe from '@/utils/asyncPipe';
import { UserService } from '@/time/user/services/user.service';
import { UserDto } from '@/time/dtos/user.dto';
import { CacheKeyHeaderInterceptor } from '@/interceptors/cacheKeyHeader.interceptor';

@UseInterceptors(CacheKeyHeaderInterceptor)
@Controller('/time/past')
export class PastController {
  constructor(
    private readonly pastService: PastService,
    private readonly userService: UserService,
  ) {}

  @Get('count')
  async getPastCount(@Body() body: UserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.pastService.getMonthPast.bind(this.pastService),
    );
    return await pipeline(body);
  }

  @Get(':date')
  async getPast(@Param('date') date: string, @Body() body: UserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.pastService.getPastDay.bind(this.pastService),
    );
    return await pipeline({ ...body, date: date });
  }

  @Put(':id')
  async updatePastDay(@Param('id') id: string, @Body() body: PastDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.pastService.updatePast.bind(this.pastService),
    );
    return await pipeline({ id, ...body });
  }

  @Post()
  async createPast(@Body() body: PastDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.pastService.createPast.bind(this.pastService),
    );
    return await pipeline(body);
  }

  @Get('/calendar/:date')
  async getPastCalendar(@Param('date') date: string, @Body() body: UserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.pastService.getCalendarPast.bind(this.pastService),
    );
    return await pipeline({ date, ...body });
  }

  @Public()
  @Get('/cleanup/:startTime')
  async cleanUpImages(@Param('startTime') startTime: string) {
    return await this.pastService.cleanUpImage(startTime);
  }
}
