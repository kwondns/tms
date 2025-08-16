import { Body, Controller, Get, Patch, Post, UseInterceptors } from '@nestjs/common';
import { FutureService } from '@/time/future/future.service';
import { FutureDto } from '@/time/dtos/future.dto';
import { FutureBoxDto } from '@/time/dtos/futureBox.dto';
import { FutureCreateDto } from '@/time/dtos/futureCreate.dto';
import { FutureBoxCreateDto } from '@/time/dtos/futureBoxCreate.dto';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { ResponseFutureBoxDto } from '@/time/dtos/responseFuture.dto';
import asyncPipe from '@/utils/asyncPipe';
import { UserService } from '@/time/user/services/user.service';
import { UserDto } from '@/time/dtos/user.dto';
import { Future } from '@/time/entities/future.entity';
import { FutureBox } from '@/time/entities/futureBox.entity';
import { CacheKeyHeaderInterceptor } from '@/interceptors/cacheKeyHeader.interceptor';

@Serialize(ResponseFutureBoxDto)
@UseInterceptors(CacheKeyHeaderInterceptor)
@Controller('/time/future')
export class FutureController {
  constructor(
    private readonly futureService: FutureService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getFutureBox(@Body() body: UserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.futureService.getFutureBox.bind(this.futureService),
    );
    return pipeline(body);
  }

  @Get('record')
  getFutureBoxRecord() {
    return this.futureService.getFutureBoxRecord();
  }

  @Patch()
  async patchFuture(@Body() body: FutureDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.futureService.patchFuture.bind(this.futureService),
    );
    return await pipeline(body);
  }

  @Post()
  async createFuture(@Body() body: FutureCreateDto) {
    const pipeline = await asyncPipe<FutureCreateDto, Future>(
      this.userService.findUserByUserId.bind(this.userService),
      this.futureService.createFuture.bind(this.futureService),
    );
    return await pipeline(body);
  }

  @Post('box')
  async createFutureBox(@Body() body: FutureBoxCreateDto) {
    const pipeline = await asyncPipe<FutureBoxCreateDto, FutureBox>(
      this.userService.findUserByUserId.bind(this.userService),
      this.futureService.createFutureBox.bind(this.futureService),
    );
    return await pipeline(body);
  }

  @Patch('box')
  async patchFutureBox(@Body() body: FutureBoxDto) {
    const pipeline = await asyncPipe<FutureBoxDto, FutureBox>(
      this.userService.findUserByUserId.bind(this.userService),
      this.futureService.patchFutureBox.bind(this.futureService),
    );
    return await pipeline(body);
  }

  @Get('analysis')
  async getFutureAnalysis(@Body() body: UserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.futureService.getFutureAnalysis.bind(this.futureService),
    );
    return await pipeline(body);
  }
}
