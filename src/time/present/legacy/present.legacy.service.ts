import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Present } from '@/time/entities/legacy/present.legacy.entity';
import { Repository } from 'typeorm';
import { PresentDto } from '@/time/dtos/legacy/present.legacy.dto';
import { PresentLegacyGateway } from '@/time/events/legacy/present.legacy.gateway';

@Injectable()
export class PresentLegacyService {
  constructor(
    @InjectRepository(Present) private readonly presentRepo: Repository<Present>,
    private readonly presentGateway: PresentLegacyGateway,
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
