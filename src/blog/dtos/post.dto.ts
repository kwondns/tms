import { IsArray, IsString } from 'class-validator';

export class PostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  index: string;

  @IsArray()
  @IsString({ each: true })
  tag: string[];

  @IsString()
  preview_image: string;

  @IsString()
  preview_content: string;

  @IsString()
  category: string;
}
