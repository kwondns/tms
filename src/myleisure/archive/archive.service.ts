import { BadRequestException, Injectable } from '@nestjs/common';
import { ArchiveGetPayloadType } from '@/myleisure/archive/types/leisure.type';
import { ArchiveRepository } from '@/myleisure/archive/archive.repository';

@Injectable()
export class ArchiveService {
  constructor(private readonly archiveRepository: ArchiveRepository) {}
  async getAllArchiveIds(user_id: string) {
    try {
      const result = await this.archiveRepository.getArchiveId(user_id);
      return result.map((leisure) => leisure.leisure_id);
    } catch (e) {
      throw new BadRequestException('archive.controller.getAllArchiveIds');
    }
  }
  async getArchives(payload: ArchiveGetPayloadType) {
    try {
      const count = await this.archiveRepository.getArchiveId(payload.user_id);
      const result = await this.archiveRepository.getArchive(payload);
      return { count: count.length, result };
    } catch (e) {
      throw new BadRequestException('archive.controller.getArchives');
    }
  }

  async makeArchive(user_id: string, leisure_id: number) {
    try {
      return await this.archiveRepository.postArchive(user_id, leisure_id);
    } catch (e) {
      throw new BadRequestException('archive.controller.makeArchive');
    }
  }

  async delArchive(user_id: string, leisure_id: number) {
    try {
      return await this.archiveRepository.removeArchive(user_id, leisure_id);
    } catch (e) {
      throw new BadRequestException('archive.controller.delArchive');
    }
  }
}
