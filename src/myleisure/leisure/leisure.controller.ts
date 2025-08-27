import { Controller, Get, Param } from '@nestjs/common';
import { LeisureService } from '@/myleisure/leisure/leisure.service';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { LeisurePreviewResponseDto } from '@/myleisure/leisure/dtos/leisure.dto';
import { Public } from '@/decorators/public.decorator';

@Controller('myleisure/leisure')
export class LeisureController {
  constructor(private readonly leisureService: LeisureService) {}

  @Public()
  @Get()
  async leisure(@Param() payload: { id: number }) {
    return await this.leisureService.getLeisure(payload.id);
  }

  @Public()
  @Serialize(LeisurePreviewResponseDto)
  @Get('recent')
  async recentLeisure(@Param() payload: { recentLeisure: string }) {
    if (!payload.recentLeisure) return [];
    const recentIds = JSON.parse(payload.recentLeisure);
    return await this.leisureService.getRecentLeisure(recentIds);
  }
}
