import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class PostUpdateDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  preview_image: string;

  @IsString()
  @IsOptional()
  preview_content: string;

  @IsBoolean()
  @IsOptional()
  visible: boolean;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tag: string[];
}
