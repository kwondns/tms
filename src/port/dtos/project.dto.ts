import { IsArray, IsBoolean, IsString } from 'class-validator';

export class ProjectDto {
  @IsString()
  preview_image: string;

  @IsString()
  shorten_content: string;

  @IsString()
  title: string;

  @IsString()
  date: string;

  @IsString()
  db: string;

  @IsString()
  content: string;

  @IsBoolean()
  visible: boolean;

  @IsArray()
  @IsString({ each: true })
  front_tag: string[];

  @IsArray()
  @IsString({ each: true })
  back_tag: string[];
}
