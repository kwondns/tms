import { Expose, Transform, Type } from 'class-transformer';

class StackDto {
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

  @Expose()
  recent: boolean;

  @Expose()
  tech: string;
}

export class ResponseStack {
  @Type(() => StackDto)
  @Expose()
  front: StackDto;

  @Type(() => StackDto)
  @Expose()
  back: StackDto;

  @Type(() => StackDto)
  @Expose()
  etc: StackDto;
}
export class ResponseStackDto {
  @Type(() => ResponseStack)
  @Expose()
  recent: ResponseStack;

  @Type(() => StackDto)
  @Expose()
  other: StackDto[];
}
