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
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  async getStackOthers() {
    return await this.dataSource.query(
      "SELECT * FROM (SELECT *, 'front' as tech FROM portfolio.front_stack UNION ALL SELECT *, 'back' as tech FROM portfolio.back_stack UNION ALL SELECT *, 'etc' as tech FROM portfolio.etc_stack) AS stack WHERE recent = false ORDER BY stack.category",
    );
  }

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
    const backStack = this.backStackRepo.create(attrs);
    return this.backStackRepo.save(backStack);
  }

  async createEtcStack(attrs: StackDto) {
    const stack = await this.etcStackRepo.findOneBy({ name: attrs.name });
    if (stack) throw new BadRequestException('이미 있는 스택입니다.');
    const etcStack = this.etcStackRepo.create(attrs);
    return this.etcStackRepo.save(etcStack);
  }
  async updateFrontStack(attrs: StackDto) {
    const stack = await this.frontStackRepo.findOneBy({ name: attrs.name });
    if (!stack) throw new BadRequestException('없는 스택입니다.');
    Object.assign(stack, attrs);
    return this.frontStackRepo.save(stack);
  }

  async updateBackStack(attrs: StackDto) {
    const stack = await this.backStackRepo.findOneBy({ name: attrs.name });
    if (!stack) throw new BadRequestException('없는 스택입니다.');
    Object.assign(stack, attrs);
    return this.backStackRepo.save(stack);
  }

  async updateEtcStack(attrs: StackDto) {
    const stack = await this.etcStackRepo.findOneBy({ name: attrs.name });
    if (!stack) throw new BadRequestException('없는 스택입니다.');
    Object.assign(stack, attrs);
    return this.etcStackRepo.save(stack);
  }

  async deleteFrontStack(attrs: StackDto) {
    return await this.frontStackRepo
      .createQueryBuilder('stack')
      .delete()
      .from(FrontStack)
      .where('name = :name')
      .setParameter('name', attrs.name)
      .execute();
  }

  async deleteBackStack(attrs: StackDto) {
    return await this.frontStackRepo
      .createQueryBuilder('stack')
      .delete()
      .from(FrontStack)
      .where('name = :name')
      .setParameter('name', attrs.name)
      .execute();
  }

  async deleteEtcStack(attrs: StackDto) {
    return await this.frontStackRepo
      .createQueryBuilder('stack')
      .delete()
      .from(FrontStack)
      .where('name = :name')
      .setParameter('name', attrs.name)
      .execute();
  }
}
