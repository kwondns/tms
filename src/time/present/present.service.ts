import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Present } from '../entities/present.entity';
import { Repository } from 'typeorm';
import { PresentDto } from '../dtos/present.dto';
import { PresentGateway } from '../events/present.gateway';

@Injectable()
export class PresentService {
  constructor(
    @InjectRepository(Present) private presentRepo: Repository<Present>,
    private presentGateway: PresentGateway,
  ) {}

  async getPresent() {
    return this.presentRepo.findOneBy({ id: 1 });
  }

  async storePresent(attrs: PresentDto) {
    const present = await this.getPresent();
    Object.assign(present, attrs);
    this.presentGateway.presentUpdate(present);
    return await this.presentRepo.save(present);
  }
}
