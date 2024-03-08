import { Body, Controller, Get, Put } from '@nestjs/common';
import { PresentService } from './present.service';
import { PresentDto } from '../dtos/present.dto';
import { Public } from '../../decorators/public.decorator';

@Controller('/time/present')
export class PresentController {
  constructor(private presentService: PresentService) {}

  @Public()
  @Get()
  async getPresent() {
    return this.presentService.getPresent();
  }

  @Public()
  async storePresent(@Body() body: PresentDto) {
    return this.presentService.storePresent(body);
  }
}
