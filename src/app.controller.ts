import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get('/health')
  healthCheck() {
    return true;
  }
}
