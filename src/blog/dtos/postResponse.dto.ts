import { Expose, Transform } from 'class-transformer';

export class PostResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  @Transform(({ obj }) => obj.preview_image)
  previewImage: string;

  @Expose()
  @Transform(({ obj }) => obj.preview_content)
  previewContent: string;

  @Expose()
  category: string;

  @Expose()
  @Transform(({ obj }) => obj.created_at)
  createdAt: string;

  @Expose()
  @Transform(({ obj }) => obj.tag)
  tags: string[];

  @Expose()
  @Transform(({ obj }) => obj.bg_color)
  bgColor: string[];

  @Expose()
  @Transform(({ obj }) => obj.text_color)
  textColor: string[];

  @Expose()
  content: string;

  @Expose()
  index: string[];
}

export class PostResponseWithCursorDto {
  @Expose()
  data: PostResponseDto;

  @Expose()
  next: boolean;
}

class PostNearItemDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  @Transform(({ obj }) => obj.created_at)
  createdAt: string;
}

export class PostNearListDto {
  @Expose()
  before: PostNearItemDto;

  @Expose()
  after: PostNearItemDto;
}
