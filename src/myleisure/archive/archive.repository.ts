import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Archive } from '@/myleisure/entities/user/archive.entity';
import { Repository } from 'typeorm';
import { ArchiveGetPayloadType } from '@/myleisure/archive/types/leisure.type';

@Injectable()
export class ArchiveRepository {
  constructor(@InjectRepository(Archive) private readonly archiveRepo: Repository<Archive>) {}

  async getArchiveId(user_id: string) {
    return this.archiveRepo.find({ where: { user_auth: { user_id } }, select: { leisure_id: true } });
  }

  async getArchive(payload: ArchiveGetPayloadType) {
    return this.archiveRepo.find({
      where: { user_auth: { user_id: payload.user_id } },
      select: {
        leisure: {
          id: true,
          business_name: true,
          business_photo: true,
          category: true,
          address: true,
          blog_review_count: true,
          visitor_review_count: true,
        },
      },
      take: 20,
      skip: (payload.page - 1) * 20,
      order: { created_at: 'desc' },
    });
  }

  async postArchive(user_id: string, leisure_id: number) {
    const newArchive = this.archiveRepo.create({ user_auth: { user_id }, leisure_id });
    return this.archiveRepo.save(newArchive);
  }

  async removeArchive(user_id: string, leisure_id: number) {
    return this.archiveRepo.delete({ user_auth: { user_id }, leisure_id });
  }
}
