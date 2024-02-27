import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { ResponseStackDto } from '../dtos/responseStack.dto';
import { StackDto } from '../dtos/stack.dto';
import { StackService } from './stack.service';

@Controller('/port/stack')
export class StackController {
  constructor(private stackService: StackService) {}
  @Serialize(ResponseStackDto)
  @Public()
  @Get('/front')
  getFront() {
    return this.stackService.getFrontStack();
  }

  @Serialize(ResponseStackDto)
  @Public()
  @Get('/back')
  getBack() {
    return this.stackService.getBackStack();
  }

  @Serialize(ResponseStackDto)
  @Public()
  @Get('/etc')
  getEtc() {
    return this.stackService.getEtcStack();
  }

  @Post('/front')
  createFront(@Body() body: StackDto) {
    return this.stackService.createFrontStack(body);
  }

  @Post('/back')
  createBack(@Body() body: StackDto) {
    return this.stackService.createBackStack(body);
  }

  @Post('/etc')
  createEtc(@Body() body: StackDto) {
    return this.stackService.createEtcStack(body);
  }
}
