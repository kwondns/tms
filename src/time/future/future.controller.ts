import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FutureService } from '@/time/future/future.service';
import { FutureDto } from '@/time/dtos/future.dto';
import { FutureBoxDto } from '@/time/dtos/futureBox.dto';
import { Public } from '@/decorators/public.decorator';
import { FutureCreateDto } from '@/time/dtos/futureCreate.dto';
import { FutureBoxCreateDto } from '@/time/dtos/futureBoxCreate.dto';

@Controller('/time/future')
export class FutureController {
  constructor(private futureService: FutureService) {}

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
