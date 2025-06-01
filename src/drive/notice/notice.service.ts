import { Injectable, NotFoundException } from '@nestjs/common';
import { Notice } from '@/drive/notice/notice.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNoticeDto, UpdateNoticeDto } from '@/drive/notice/notice.dto';

type UpdateNoticePropType = UpdateNoticeDto & { notice: Notice };

@Injectable()
export class NoticeService {
  constructor(@InjectRepository(Notice) private readonly noticeRepo: Repository<Notice>) {}

  async findMany(page: number) {
    const [data, count] = await this.noticeRepo.findAndCount({
      skip: (page - 1) * 9,
      take: 9,
      order: { created_at: 'DESC' },
    });
    console.log(data);
    return { data, count };
  }
  async findNearNotice(noticeId: number) {
    const currentNotice = await this.noticeRepo.findOne({ where: { notice_id: noticeId, visible: true } });
    if (!currentNotice) {
      throw new NotFoundException();
    }
    const afterNotice = await this.noticeRepo
      .createQueryBuilder('notice')
      .where('notice.visible = true')
      .andWhere('notice.created_at > :created_at', { created_at: currentNotice.created_at })
      .andWhere('notice.notice_id != :notice_id', { notice_id: noticeId })
      .orderBy('notice.created_at', 'ASC')
      .select('notice.notice_id, notice.title, notice.created_at')
      .limit(1)
      .getRawOne();

    const beforeNotice = await this.noticeRepo
      .createQueryBuilder('notice')
      .where('notice.visible = true')
      .andWhere('notice.created_at < :created_at', { created_at: currentNotice.created_at })
      .orderBy('notice.created_at', 'DESC')
      .select('notice.notice_id, notice.title, notice.created_at')
      .limit(1)
      .getRawOne();
    return { currentNotice, afterNotice, beforeNotice };
  }

  async findOne<T extends Record<'noticeId', number>>(dto: T): Promise<T> {
    const { noticeId } = dto;
    return { notice: await this.noticeRepo.findOneOrFail({ where: { notice_id: noticeId } }), ...dto };
  }

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    return this.noticeRepo.create(createNoticeDto);
  }

  async updateTitle(updateNoticeDto: UpdateNoticePropType): Promise<UpdateNoticePropType> {
    if (updateNoticeDto.title) updateNoticeDto.notice.title = updateNoticeDto.title;
    return updateNoticeDto;
  }

  async updateContent(updateNoticeDto: UpdateNoticePropType): Promise<UpdateNoticePropType> {
    if (updateNoticeDto.content) updateNoticeDto.notice.content = updateNoticeDto.content;
    return updateNoticeDto;
  }

  async updateVisible(updateNoticeDto: UpdateNoticePropType): Promise<UpdateNoticePropType> {
    if ('visible' in updateNoticeDto) updateNoticeDto.notice.visible = updateNoticeDto.visible;
    return updateNoticeDto;
  }

  passNoticeOnly(updateNoticeDto: UpdateNoticePropType): Notice {
    return updateNoticeDto.notice;
  }

  async save(notice: Notice): Promise<Notice> {
    return this.noticeRepo.save(notice);
  }

  async softDelete(notice: Notice) {
    return this.noticeRepo.softDelete(notice);
  }
}
