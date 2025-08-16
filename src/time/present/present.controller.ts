import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { PresentService } from '@/time/present/present.service';
import { PresentDto } from '@/time/dtos/present.dto';
import { CacheKeyHeaderInterceptor } from '@/interceptors/cacheKeyHeader.interceptor';
import asyncPipe from '@/utils/asyncPipe';
import { UserService } from '@/time/user/services/user.service';
import { UserDto } from '@/time/dtos/user.dto';

@UseInterceptors(CacheKeyHeaderInterceptor)
@Controller('/time/present')
export class PresentController {
  constructor(
    private readonly presentService: PresentService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getPresent(@Body() body: UserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.presentService.getPresent.bind(this.presentService),
    );
    return await pipeline(body);
  }

  @Patch()
  async storePresent(@Body() body: PresentDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.presentService.storePresent.bind(this.presentService),
    );
    return await pipeline(body);
  }
}
