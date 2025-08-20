import { Body, Controller, Get, Put } from '@nestjs/common';
import { PresentLegacyService } from '@/time/present/legacy/present.legacy.service';
import { PresentDto } from '@/time/dtos/legacy/present.legacy.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('/time/legacy/present')
export class PresentLegacyController {
  constructor(private readonly presentService: PresentLegacyService) {}

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
