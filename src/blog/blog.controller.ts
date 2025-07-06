import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '@/decorators/public.decorator';
import { BlogService } from '@/blog/blog.service';
import { PostDto } from '@/blog/dtos/post.dto';
import { PostUpdateDto } from '@/blog/dtos/postUpdate.dto';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { PostNearListDto, PostResponseDto, PostResponseWithCursorDto } from '@/blog/dtos/postResponse.dto';
import { CategoryResponseDto } from '@/blog/dtos/categoryResponse.dto';
import { TagRankResponseDto } from '@/blog/dtos/tagRankResponse.dto';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Public()
  @Post('new')
  async createBlogPost(@Body() body: PostDto) {
    return await this.blogService.createBlogPost(body);
  }

  @Public()
  @Serialize(CategoryResponseDto)
  @Get('category')
  async getAllCategory() {
    return await this.blogService.getAllCategory();
  }

  @Public()
  @Serialize(TagRankResponseDto)
  @Get('tags')
  async getTagRanks() {
    return await this.blogService.getTagRanks();
  }

  @Serialize(PostResponseWithCursorDto)
  @Get('manage/:page')
  async getBlogAllPost(@Param('page') page: number) {
    return {
      data: await this.blogService.getBlogPostAll(page),
      next: (await this.blogService.getBlogPostAll(++page)).length > 0,
    };
  }

  @Public()
  @Serialize(PostResponseDto)
  @Get('content/:id')
  async getBlogPostContent(@Param('id') id: string) {
    return await this.blogService.getContentBlogPost(id);
  }

  @Public()
  @Serialize(PostNearListDto)
  @Get('near/:id')
  async getNearPostList(@Param('id') id: string) {
    return await this.blogService.getNearPostList(id);
  }

  @Public()
  @Serialize(PostResponseWithCursorDto)
  @Get('category/:category')
  async getCategoryBlogPost(@Param('category') category: string, @Query('page') page: number) {
    return {
      data: await this.blogService.getCategoryBlogPost(category, page),
      next: (await this.blogService.getCategoryBlogPost(category, ++page)).length > 0,
    };
  }

  @Public()
  @Serialize(PostResponseWithCursorDto)
  @Get(':page')
  async getRecentBlogPost(@Param('page') page: number) {
    return {
      data: await this.blogService.getBlogPost(page),
      next: (await this.blogService.getBlogPost(++page)).length > 0,
    };
  }

  @Public()
  @Patch(':id')
  async updateBlogPost(@Param('id') id: string, @Body() body: PostUpdateDto) {
    return await this.blogService.updateBlogPost(id, body);
  }
}
