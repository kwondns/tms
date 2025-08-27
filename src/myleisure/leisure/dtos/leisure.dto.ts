import { Expose, Type } from 'class-transformer';

export class LeisureDto {
  @Expose()
  id: string;

  @Expose({ name: 'business_name' })
  name: string;

  @Expose()
  category: string;

  @Expose({ name: 'visitor_review_count' })
  visitorReview: number;

  @Expose({ name: 'blog_review_count' })
  blogReview: number;

  @Expose()
  address: string;

  @Expose({ name: 'business_photo' })
  previewImg: string;
}

export class LeisurePreviewResponseDto {
  @Type(() => LeisureDto)
  leisure: LeisureDto;
}
