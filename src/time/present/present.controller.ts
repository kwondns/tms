import { Body, Controller, Get, Put } from '@nestjs/common';
import { PresentService } from '@/time/present/present.service';
import { PresentDto } from '@/time/dtos/present.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('/time/present')
export class PresentController {
  constructor(private presentService: PresentService) {}

  @Public()
  @Get()
  async getPresent() {
    return this.presentService.getPresent();
  }

  @Put()
  async storePresent(@Body() body: PresentDto) {
    return this.presentService.storePresent(body);
  }
}
