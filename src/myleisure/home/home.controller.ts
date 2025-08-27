import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from '@/myleisure/home/home.service';
import { GenderAndAgeType } from '@/myleisure/home/types/searchTrend.type';
import { Public } from '@/decorators/public.decorator';

@Controller('/myleisure/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('banner')
  async getHomeBanner() {
    return await this.homeService.getVisibleBanner();
  }

  @Public()
  @Get('magazine')
  async getHomeMagazine() {
    return await this.homeService.getVisibleMagazine();
  }

  @Public()
  @Get('section')
  async getHomeSection() {
    return await this.homeService.getSections();
  }

  @Get('hottest')
  async getHomeHottest(@Query() payload: GenderAndAgeType) {
    return await this.homeService.getHottest(payload);
  }
}
