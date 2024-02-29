import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { ResponseStackDto } from '../dtos/responseStack.dto';
import { StackDto } from '../dtos/stack.dto';
import { StackService } from './stack.service';

@Controller('/port/stack')
export class StackController {
  constructor(private stackService: StackService) {}

  @Public()
  @Get()
  @Serialize(ResponseStackDto)
  async getStack() {
    const response = {};
    [response['front'], response['back'], response['etc']] = await Promise.all([
      this.stackService.getFrontStack(),
      this.stackService.getBackStack(),
      this.stackService.getEtcStack(),
    ]);
    return response;
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
