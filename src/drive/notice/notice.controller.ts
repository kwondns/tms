import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { NoticeService } from '@/drive/notice/notice.service';
import {
  CreateNoticeDto,
  DeleteNoticeDto,
  NoticeDetailResponseDto,
  NoticeResponseDto,
  UpdateNoticeDto,
} from '@/drive/notice/notice.dto';
import asyncPipe from '@/utils/asyncPipe';
import { Serialize } from '@/interceptors/serialize.interceptor';

@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @Serialize(NoticeResponseDto)
  async getNotice(@Query('page') page: number) {
    const a = await this.noticeService.findMany(page);
    console.log(a);
    return a;
  }

  @Get(':noticeId')
  @Serialize(NoticeDetailResponseDto)
  // @Cache()
  async getNoticeOne(@Param('noticeId') noticeId: number) {
    return await this.noticeService.findNearNotice(noticeId);
  }

  @Post()
  @Serialize(NoticeResponseDto)
  async createNotice(@Body() createNoticeDto: CreateNoticeDto) {
    const pipeline = await asyncPipe(
      this.noticeService.create.bind(this.noticeService),
      this.noticeService.save.bind(this.noticeService),
    );
    return pipeline(createNoticeDto);
  }

  @Patch()
  @Serialize(NoticeResponseDto)
  async updateNotice(@Body() updateNoticeDto: UpdateNoticeDto) {
    const pipeline = await asyncPipe(
      this.noticeService.findOne.bind(this.noticeService),
      this.noticeService.updateTitle.bind(this.noticeService),
      this.noticeService.updateContent.bind(this.noticeService),
      this.noticeService.updateVisible.bind(this.noticeService),
      this.noticeService.passNoticeOnly.bind(this.noticeService),
      this.noticeService.save.bind(this.noticeService),
    );
    return pipeline(updateNoticeDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Serialize(NoticeResponseDto)
  async deleteNotice(@Query() deleteNoticeDto: DeleteNoticeDto) {
    const pipeline = await asyncPipe(
      this.noticeService.findOne.bind(this.noticeService),
      this.noticeService.passNoticeOnly.bind(this.noticeService),
      this.noticeService.softDelete.bind(this.noticeService),
    );
    return pipeline({ noticeId: deleteNoticeDto.noticeId });
  }
}
