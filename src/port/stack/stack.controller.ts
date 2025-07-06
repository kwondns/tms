import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { Public } from '@/decorators/public.decorator';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { ResponseStackDto } from '@/port/dtos/responseStack.dto';
import { StackDto } from '@/port/dtos/stack.dto';
import { StackService } from '@/port/stack/stack.service';

@Controller('/port/stack')
export class StackController {
  constructor(private stackService: StackService) {}

  @Public()
  @Get()
  @Serialize(ResponseStackDto)
  async getStack() {
    const recent = {};
    const other = {};
    [recent['front'], recent['back'], recent['etc'], other['other']] = await Promise.all([
      this.stackService.getFrontStack(),
      this.stackService.getBackStack(),
      this.stackService.getEtcStack(),
      this.stackService.getStackOthers(),
    ]);
    return {
      recent,
      other: other['other'],
    };
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

  @Put('/front')
  updateFront(@Body() body: StackDto) {
    return this.stackService.updateFrontStack(body);
  }

  @Put('/back')
  updateBack(@Body() body: StackDto) {
    return this.stackService.updateBackStack(body);
  }

  @Put('/etc')
  updateEtc(@Body() body: StackDto) {
    return this.stackService.updateEtcStack(body);
  }
  @Delete('/front')
  deleteFront(@Body() body: StackDto) {
    return this.stackService.deleteFrontStack(body);
  }

  @Delete('/back')
  deleteBack(@Body() body: StackDto) {
    return this.stackService.deleteBackStack(body);
  }

  @Delete('/etc')
  deleteEtc(@Body() body: StackDto) {
    return this.stackService.deleteEtcStack(body);
  }
}
