import { Expose, Transform } from 'class-transformer';

export class ResponseStackDto {
  @Expose()
  @Transform(({ value }) => (process.env.NODE_ENV === 'production' ? value : value.split(',')))
  name: string[];

  @Expose()
  @Transform(({ value }) => (process.env.NODE_ENV === 'production' ? value : value.split(',')))
  url: string[];

  @Expose()
  @Transform(({ value }) => (process.env.NODE_ENV === 'production' ? value : value.split(',')))
  img: string[];

  @Expose()
  category: string;
}
