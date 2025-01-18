import { Expose, Transform } from 'class-transformer';

export class TagRankResponseDto {
  @Expose()
  tag: string;

  @Expose()
  @Transform(({ obj }) => obj.tag_count)
  tagCount: number;

  @Expose()
  @Transform(({ obj }) => obj.bg_color)
  bgColor: string;

  @Expose()
  @Transform(({ obj }) => obj.text_color)
  textColor: string;
}
