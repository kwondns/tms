import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BackStack,
  BackStackByCategory,
  EtcStack,
  EtcStackByCategory,
  FrontStack,
  FrontStackByCategory,
} from '../entities/stack.entity';
import { Repository } from 'typeorm';
import { StackDto } from '../dtos/stack.dto';

@Injectable()
export class StackService {
  constructor(
    @InjectRepository(FrontStack) private frontStackRepo: Repository<FrontStack>,
    @InjectRepository(BackStack) private backStackRepo: Repository<BackStack>,
    @InjectRepository(EtcStack) private etcStackRepo: Repository<EtcStack>,
    @InjectRepository(FrontStackByCategory) private frontStackViewRepo: Repository<FrontStackByCategory>,
    @InjectRepository(BackStackByCategory) private backStackViewRepo: Repository<BackStackByCategory>,
    @InjectRepository(EtcStackByCategory) private etcStackViewRepo: Repository<EtcStackByCategory>,
  ) {}

  async getFrontStack() {
    const stack = await this.frontStackViewRepo.find();
    if (stack.length === 0) throw new BadRequestException('잘못된 요청입니다.');
    return stack;
  }
  async getBackStack() {
    const stack = await this.backStackViewRepo.find();
    if (stack.length === 0) throw new BadRequestException('잘못된 요청입니다.');
    return stack;
  }
  async getEtcStack() {
    const stack = await this.etcStackViewRepo.find();
    if (stack.length === 0) throw new BadRequestException('잘못된 요청입니다.');
    return stack;
  }

  async createFrontStack(attrs: StackDto) {
    const stack = await this.frontStackRepo.findOneBy({ name: attrs.name });
    if (stack) throw new BadRequestException('이미 있는 스택입니다.');
    const frontStack = this.frontStackRepo.create(attrs);
    return this.frontStackRepo.save(frontStack);
  }
  async createBackStack(attrs: StackDto) {
    const stack = await this.backStackRepo.findOneBy({ name: attrs.name });
    if (stack) throw new BadRequestException('이미 있는 스택입니다.');
    const frontStack = this.backStackRepo.create(attrs);
    return this.backStackRepo.save(frontStack);
  }
  async createEtcStack(attrs: StackDto) {
    const stack = await this.etcStackRepo.findOneBy({ name: attrs.name });
    if (stack) throw new BadRequestException('이미 있는 스택입니다.');
    const frontStack = this.etcStackRepo.create(attrs);
    return this.etcStackRepo.save(frontStack);
  }
}
