import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ArchiveService } from '@/myleisure/archive/archive.service';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { LeisurePreviewResponseDto } from '@/myleisure/leisure/dtos/leisure.dto';

@Controller('myleisure')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get('archive-ids')
  async getArchiveIds(@Body() payload: { userId: string }) {
    return await this.archiveService.getAllArchiveIds(payload.userId);
  }

  @Serialize(LeisurePreviewResponseDto)
  @Get('archive')
  async getArchive(@Body() body: { userId?: string }, @Query() { page }: { page: number }) {
    if (!body.userId) throw new BadRequestException();
    return await this.archiveService.getArchives({ user_id: String(body.userId), page: Number(page) });
  }

  @Post('archive')
  async postArchive(@Body() body: { userId: string; leisure_id: number }) {
    return await this.archiveService.makeArchive(body.userId, body.leisure_id);
  }

  @Delete('archive')
  @HttpCode(204)
  async deleteArchive(@Body() body: { userId: string; leisure_id: number }) {
    return await this.archiveService.delArchive(String(body.userId), body.leisure_id);
  }
}
