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

  @Transform(({ value }) => !!value)
  @Expose()
  visible: boolean;

  @Transform(({ obj }) => obj.front_tag.map((tag) => tag.front_tag))
  @Expose()
  front_tag: string[];

  @Transform(({ obj }) => obj.back_tag.map((tag) => tag.back_tag))
  @Expose()
  back_tag: string[];

  @Transform(({ obj }) => (obj.projectDetail ? obj.projectDetail.role : null))
  @Expose()
  role: string;

  @Transform(({ obj }) => (obj.projectDetail ? obj.projectDetail.context : null))
  @Expose()
  context: string;

  @Transform(({ obj }) => (obj.projectDetail ? obj.projectDetail.link : null))
  @Expose()
  link: string;

  @Transform(({ obj }) => (obj.projectDetail ? obj.projectDetail.images : null))
  @Expose()
  images: string;

  @Expose()
  @Transform(({ value, obj }) => (value ? obj.projectMoreDetail.content : null))
  projectMoreDetail: string;

  @Expose()
  @Transform(({ obj }) => (obj.project_modal_data ? obj.project_modal_data.modal_content : null))
  modal_content: string;

  @Expose()
  @Transform(({ obj }) => (obj.project_modal_data ? obj.project_modal_data.modal_role : null))
  modal_role: string;
}
