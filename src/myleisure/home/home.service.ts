import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeRepository } from '@/myleisure/home/home.repository';
import { GenderAndAgeType } from '@/myleisure/home/types/searchTrend.type';

@Injectable()
export class HomeService {
  constructor(private readonly homeRepository: HomeRepository) {}

  async getVisibleBanner() {
    try {
      return await this.homeRepository.getBanner();
    } catch (e) {
      throw new BadRequestException('home.controller.getVisibleBanner');
    }
  }

  async getVisibleMagazine() {
    try {
      return await this.homeRepository.getMagazine();
    } catch (e) {
      throw new BadRequestException(e, 'home.controller.getVisibleMagazine');
    }
  }
  async getHottest(payload: GenderAndAgeType) {
    try {
      const result = await this.homeRepository.getSearchTrendByAgeAndGender({
        age: Number(payload.age),
        gender: Number(payload.gender),
      });
      if (!result) throw new BadRequestException('에러가 발생했습니다.');
      const [leisure1, leisure2, leisure3, leisure4, leisure5] = await Promise.all([
        this.homeRepository.getLeisurePreview(result.leisure_1_id.split(',').map(Number)),
        this.homeRepository.getLeisurePreview(result.leisure_2_id.split(',').map(Number)),
        this.homeRepository.getLeisurePreview(result.leisure_3_id.split(',').map(Number)),
        this.homeRepository.getLeisurePreview(result.leisure_4_id.split(',').map(Number)),
        this.homeRepository.getLeisurePreview(result.leisure_5_id.split(',').map(Number)),
      ]);
      return {
        rank: [
          result.leisure_1_category,
          result.leisure_2_category,
          result.leisure_3_category,
          result.leisure_4_category,
          result.leisure_5_category,
        ],
        data: {
          [result.leisure_1_category]: leisure1,
          [result.leisure_2_category]: leisure2,
          [result.leisure_3_category]: leisure3,
          [result.leisure_4_category]: leisure4,
          [result.leisure_5_category]: leisure5,
        },
      };
    } catch (e) {
      throw new BadRequestException('home.controller.getHottest');
    }
  }
  shuffleArray(array: unknown[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지의 랜덤 인덱스
      [array[i], array[j]] = [array[j], array[i]]; // 배열 요소 교환
    }
    return array;
  }
  async getSections() {
    try {
      const sectionTitle = await this.homeRepository.getSectionTitles();
      const [sectionOneIds, sectionTwoIds, sectionThreeIds, sectionFourIds] = await Promise.all([
        this.homeRepository.getSectionOneIds(),
        this.homeRepository.getSectionTwoIds(),
        this.homeRepository.getSectionThreeIds(),
        this.homeRepository.getSectionFourIds(),
      ]);
      const sectionOnePromises = sectionOneIds.map(
        async (value) => await this.homeRepository.getLeisurePreview(value.leisure_id.split(',').map(Number)),
      );
      const sectionTwoPromises = sectionTwoIds.map(
        async (value) => await this.homeRepository.getLeisurePreview(value.leisure_id.split(',').map(Number)),
      );
      const sectionThreePromises = sectionThreeIds.map(
        async (value) => await this.homeRepository.getLeisurePreview(value.leisure_id.split(',').map(Number)),
      );
      const sectionFourPromises = sectionFourIds.map(
        async (value) => await this.homeRepository.getLeisurePreview(value.leisure_id.split(',').map(Number)),
      );
      const [sectionOne, sectionTwo, sectionThree, sectionFour] = await Promise.all([
        ...sectionOnePromises,
        ...sectionTwoPromises,
        ...sectionThreePromises,
        ...sectionFourPromises,
      ]);

      return {
        title: [sectionTitle?.section1, sectionTitle?.section2, sectionTitle?.section3, sectionTitle?.section4],
        data: [this.shuffleArray(sectionOne), this.shuffleArray(sectionTwo), sectionThree, sectionFour],
      };
    } catch (e) {
      throw new BadRequestException('home.controller.getSections');
    }
  }
}
