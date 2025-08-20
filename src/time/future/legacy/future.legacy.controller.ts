import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FutureLegacyService } from '@/time/future/legacy/future.legacy.service';
import { FutureDto } from '@/time/dtos/legacy/future.legacy.dto';
import { FutureBoxDto } from '@/time/dtos/legacy/futureBox.legacy.dto';
import { Public } from '@/decorators/public.decorator';
import { FutureCreateDto } from '@/time/dtos/legacy/futureCreate.legacy.dto';
import { FutureBoxCreateDto } from '@/time/dtos/legacy/futureBoxCreate.legacy.dto';

@Controller('/time/legacy/future')
export class FutureLegacyController {
  constructor(private readonly futureService: FutureLegacyService) {}

  @Public()
  @Get(':priority')
  getFutureBox(@Param('priority') priority: number) {
    return this.futureService.getFutureBox(priority);
  }
  @Public()
  @Get(':priority/record')
  getFutureBoxRecord(@Param('priority') priority: number) {
    return this.futureService.getFutureBoxRecord(priority);
  }

  @Patch()
  patchFuture(@Body() body: FutureDto) {
    return this.futureService.patchFuture(body);
  }

  @Post()
  createFuture(@Body() body: FutureCreateDto) {
    return this.futureService.createFuture(body);
  }

  @Post('box')
  createFutureBox(@Body() body: FutureBoxCreateDto) {
    return this.futureService.createFutureBox(body);
  }

  @Patch('box')
  patchFutureBox(@Body() body: FutureBoxDto) {
    return this.futureService.patchFutureBox(body);
  }
}
