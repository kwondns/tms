import { Injectable } from '@nestjs/common';
import { LeisureRepository } from '@/myleisure/leisure/leisure.repository';

@Injectable()
export class LeisureService {
  constructor(private readonly leisureRepository: LeisureRepository) {}

  async getLeisure(id: number) {
    const { default_leisure, ...others } = await this.leisureRepository.getLeisureById(id);
    return { ...others, ...default_leisure };
  }

  async getRecentLeisure(ids: number[]) {
    return this.leisureRepository.getRecentLeisureByIds(ids);
  }
}
