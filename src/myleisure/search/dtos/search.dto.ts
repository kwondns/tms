import { Expose, Type } from 'class-transformer';

export class SearchDto {
  @Expose()
  id: number;

  @Expose({ name: 'blogreview' })
  blogReview: number;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose({ name: 'previewimg' })
  previewImg: string;

  @Expose({ name: 'visitorreview' })
  visitorReview: number;

  @Expose()
  category: string;
}

export class SearchResultDto {
  @Expose()
  count: number;

  @Type(() => SearchDto)
  @Expose()
  result: SearchDto[];
}
