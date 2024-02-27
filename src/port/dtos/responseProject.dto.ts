import { Expose, Transform } from 'class-transformer';

export class ResponseProjectDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  shorten_content: string;

  @Expose()
  preview_image: string;

  @Expose()
  date: string;

  @Expose()
  db: string;

  @Transform(({ obj }) => obj.front_tag.map((tag) => tag.front_tag))
  @Expose()
  front_tag: string[];

  @Transform(({ obj }) => obj.back_tag.map((tag) => tag.back_tag))
  @Expose()
  back_tag: string[];
}