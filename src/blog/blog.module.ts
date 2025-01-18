import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, PostView } from './entities/post.entity';
import { PostTag } from './entities/postTag.entity';
import { PostContent } from './entities/postContent.entity';
import { Tag, TagCountView } from './entities/tag.entity';
import { Category, CategoryWithCount } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostTag, PostContent, Tag, Category, CategoryWithCount, PostView, TagCountView]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
