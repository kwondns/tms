import { BadRequestException, Injectable } from '@nestjs/common';
import { GenderAndAgeType, LeisureQueryResult } from '@/myleisure/home/types/searchTrend.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Section1, Section2, Section3, Section4, SectionTitle } from '@/myleisure/entities/section/section.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { HomeBanner } from '@/myleisure/entities/section/banner.entity';
import { HomeMagazine } from '@/myleisure/entities/section/magazine.entity';
import { SearchTrend } from '@/myleisure/entities/section/searchTrend.entity';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';

@Injectable()
export class HomeRepository {
  constructor(
    @InjectRepository(Section1) private readonly section1Repo: Repository<Section1>,
    @InjectRepository(Section2) private readonly section2Repo: Repository<Section2>,
    @InjectRepository(Section3) private readonly section3Repo: Repository<Section3>,
    @InjectRepository(Section4) private readonly section4Repo: Repository<Section4>,
    @InjectRepository(SectionTitle) private readonly sectionTitleRepo: Repository<SectionTitle>,
    @InjectRepository(HomeBanner) private readonly bannerRepo: Repository<HomeBanner>,
    @InjectRepository(HomeMagazine) private readonly magazineRepo: Repository<HomeMagazine>,
    @InjectRepository(SearchTrend) private readonly searchTrendRepo: Repository<SearchTrend>,
    @InjectRepository(Leisure) private readonly leisureRepo: Repository<Leisure>,
  ) {}
  async getBanner() {
    try {
      return await this.bannerRepo.find({ where: { visible: true, expired_at: MoreThan(new Date()) } });
    } catch (e) {
      throw new BadRequestException('home.service.getBanner');
    }
  }

  async getMagazine() {
    try {
      return await this.magazineRepo.find({ where: { visible: true, expired_at: MoreThan(new Date()) } });
    } catch (e) {
      throw new BadRequestException('home.service.getMagazine');
    }
  }
  async getSearchTrendByAgeAndGender(payload: GenderAndAgeType) {
    try {
      return await this.searchTrendRepo.findOne({ where: payload });
    } catch (e) {
      throw new BadRequestException('home.service.getSearchTrendByAgeAndGender');
    }
  }

  async getLeisurePreview(ids: number[]) {
    const columnTransform = (queryResult: LeisureQueryResult) => {
      return {
        id: queryResult.id,
        name: queryResult.business_name,
        category: queryResult.category,
        visitorReview: Number(queryResult.visitor_review_count),
        blogReview: Number(queryResult.blog_review_count),
        address: queryResult.address,
        previewImg: queryResult.business_photo,
      };
    };
    try {
      const leisure = await this.leisureRepo.find({
        where: { id: In(ids) },
        select: {
          category: true,
          business_name: true,
          address: true,
          business_photo: true,
          visitor_review_count: true,
          blog_review_count: true,
          id: true,
        },
      });
      return leisure.map((result) => columnTransform(result as unknown as LeisureQueryResult));
    } catch (e) {
      throw new BadRequestException('home.service.getLeisurePreview');
    }
  }

  getSectionTitles = async () => {
    try {
      return await this.sectionTitleRepo.findOne({ where: { id: 1 } });
    } catch (e) {
      console.log(e);
      throw new BadRequestException('home.service.getSectionTitles');
    }
  };

  getSectionOneIds = async () => {
    try {
      return await this.section1Repo.find();
    } catch (e) {
      throw new BadRequestException('home.service.getSectionOneIds');
    }
  };
  getSectionTwoIds = async () => {
    try {
      return await this.section2Repo.find();
    } catch (e) {
      throw new BadRequestException('home.service.getSectionTwoIds');
    }
  };
  getSectionThreeIds = async () => {
    try {
      return await this.section3Repo.find();
    } catch (e) {
      throw new BadRequestException('home.service.getSectionThreeIds');
    }
  };

  getSectionFourIds = async () => {
    try {
      return await this.section4Repo.find();
    } catch (e) {
      throw new BadRequestException('home.service.getSectionFourIds');
    }
  };
}
