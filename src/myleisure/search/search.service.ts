import { BadRequestException, Injectable } from '@nestjs/common';
import { MapSearchType, SearchType } from '@/myleisure/search/types/search.type';
import { SearchRepository } from '@/myleisure/search/search.repository';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  searchLeisure = async (payload: SearchType) => {
    try {
      if (payload?.search) {
        payload.search = this.searchMakeClean(payload.search);
      }
      const result = await this.searchRepository.getSearch(payload);
      const count = await this.searchRepository.getSearchCount(payload);
      return { count, result };
    } catch (e) {
      console.log(e);
      throw new BadRequestException('search.controller.searchLeisure');
    }
  };

  searchLeisureMap = async (payload: MapSearchType) => {
    try {
      if (payload?.search) {
        payload.search = this.searchMakeClean(payload.search);
      }
      const result = await this.searchRepository.getSearchMap(payload);
      const returnValue: { [key: string]: object } = {};
      result.forEach((value) => {
        const { address, ...others } = value;
        returnValue[address] = { ...others };
      });
      return returnValue;
    } catch (e) {
      console.log(e);
      throw new BadRequestException('search.controller.searchLeisureMap');
    }
  };
  searchMakeClean = (search: string) => {
    const FilterList = ['캠핑장', '캠핑', '클라이밍'];

    const pattern = new RegExp(FilterList.join('|'), 'g');
    const cleanedSearch = search.replace(pattern, '').trim();
    return cleanedSearch.length === 0 ? search : cleanedSearch;
  };

  searchMapPinedLeisurePreview = async (id: number) => {
    try {
      const result = await this.searchRepository.getMapPreviewLeisure(id);
      const { visitor_review_count, blog_review_count, business_name, business_address, business_photo, ...others } =
        result;
      return {
        name: business_name,
        visitorReview: Number(visitor_review_count),
        blogReview: Number(blog_review_count),
        previewImg: business_photo,
        fullAddress: business_address,
        ...others,
      };
    } catch (e) {
      throw new BadRequestException('search.controller.searchMapPinedLeisurePreview');
    }
  };

  searchOnlyCount = async (payload: MapSearchType) => {
    try {
      if (payload?.search) {
        payload.search = this.searchMakeClean(payload.search);
      }
      console.log(payload);
      const count = await this.searchRepository.getSearchCount({ ...payload, page: 1 });
      return { count };
    } catch (e) {
      console.log(e);
      throw new BadRequestException('search.controller.searchLeisureMap');
    }
  };
}
