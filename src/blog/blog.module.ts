import { Module } from '@nestjs/common';
import { BlogController } from '@/blog/blog.controller';
import { BlogService } from '@/blog/blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, PostView } from '@/blog/entities/post.entity';
import { PostTag } from '@/blog/entities/postTag.entity';
import { PostContent } from '@/blog/entities/postContent.entity';
import { Tag, TagCountView } from '@/blog/entities/tag.entity';
import { Category, CategoryWithCount } from '@/blog/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostTag, PostContent, Tag, Category, CategoryWithCount, PostView, TagCountView]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
