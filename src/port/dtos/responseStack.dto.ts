import { Expose, Type } from 'class-transformer';

class StackDto {
  @Expose()
  name: string[];

  @Expose()
  url: string[];

  @Expose()
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
