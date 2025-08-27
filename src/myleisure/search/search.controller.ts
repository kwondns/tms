import { Controller, Get, Query } from '@nestjs/common';
import { MapSearchType, SearchType } from '@/myleisure/search/types/search.type';
import { SearchService } from '@/myleisure/search/search.service';
import { Public } from '@/decorators/public.decorator';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { SearchResultDto } from '@/myleisure/search/dtos/search.dto';

@Controller('myleisure')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Serialize(SearchResultDto)
  @Get('search')
  async getSearch(@Query() payload: SearchType) {
    return await this.searchService.searchLeisure(payload);
  }

  @Public()
  @Get('search-count')
  async getSearchCount(@Query() payload: MapSearchType) {
    return await this.searchService.searchOnlyCount(payload);
  }

  @Public()
  @Get('map')
  async getMap(@Query() payload: MapSearchType) {
    return await this.searchService.searchLeisureMap(payload);
  }

  @Public()
  @Get('map-preview')
  async getMapPreview(@Query() payload: { id: string }) {
    return await this.searchService.searchMapPinedLeisurePreview(Number(payload.id));
  }
}
