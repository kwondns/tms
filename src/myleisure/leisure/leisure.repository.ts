import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';

@Injectable()
export class LeisureRepository {
  constructor(@InjectRepository(Leisure) private readonly leisureRepo: Repository<Leisure>) {}

  async getLeisureById(id: number) {
    try {
      return await this.leisureRepo.findOne({ where: { id }, relations: ['default_leisure'] });
    } catch (e) {
      throw new BadRequestException('leisure.controller.getLeisure');
    }
  }

  async getRecentLeisureByIds(ids: number[]) {
    try {
      const result = await this.leisureRepo.findBy({ id: In(ids) });
      return ids.map((id) => result.find((item) => item.id === id));
    } catch (e) {
      throw new BadRequestException('leisure.controller.getRecentLeisure');
    }
  }
}
