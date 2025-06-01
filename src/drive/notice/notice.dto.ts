import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

export class CreateNoticeDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class UpdateNoticeDto {
  @IsNumber()
  noticeId: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}

export class DeleteNoticeDto {
  @IsNumber()
  noticeId: number;
}

export class NoticeResultDto {
  @Expose({ name: 'notice_id' })
  noticeId: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  visible: boolean;

  @Transform(({ obj }) => obj.created_at)
  @Expose()
  createdAt: string;

  @Transform(({ obj }) => obj.updated_at)
  @Expose()
  updatedAt: string;
}

export class NoticeResponseDto {
  @Type(() => NoticeResultDto)
  @Expose()
  data: NoticeResultDto[];

  @Expose()
  count: number;
}

export class NoticeDetailResponseDto {
  @Expose()
  currentNotice: NoticeResultDto;

  @Expose()
  afterNotice: NoticeResultDto;

  @Expose()
  beforeNotice: NoticeResultDto;
}
