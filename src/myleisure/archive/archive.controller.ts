import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ArchiveService } from '@/myleisure/archive/archive.service';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { LeisurePreviewResponseDto } from '@/myleisure/leisure/dtos/leisure.dto';

@Controller('myleisure')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get('archive-ids')
  async getArchiveIds(@Param('user') { user }: { user: string }) {
    return { status: 200, data: await this.archiveService.getAllArchiveIds(user) };
  }

  @Serialize(LeisurePreviewResponseDto)
  @Get('archive')
  async getArchive(@Param() { user, page }: { user: string; page: number }) {
    return { status: 200, data: await this.archiveService.getArchives({ user_id: String(user), page: Number(page) }) };
  }

  @Post('archive')
  async postArchive(@Body() { user, leisure_id }: { user: string; leisure_id: number }) {
    return { status: 201, data: await this.archiveService.makeArchive(user, leisure_id) };
  }

  @Delete('archive')
  async deleteArchive(@Body() { user, leisure_id }: { user: string; leisure_id: number }) {
    return { status: 204, data: await this.archiveService.delArchive(String(user), leisure_id) };
  }
}
