import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostView } from '@/blog/entities/post.entity';
import { PostDto } from '@/blog/dtos/post.dto';
import { PostTag } from '@/blog/entities/postTag.entity';
import { PostContent } from '@/blog/entities/postContent.entity';
import { Tag, TagCountView } from '@/blog/entities/tag.entity';
import { Category, CategoryWithCount } from '@/blog/entities/category.entity';
import { generateColorStyle } from '@/libs/generateColor';
import { PostUpdateDto } from '@/blog/dtos/postUpdate.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(PostTag) private postTagRepo: Repository<PostTag>,
    @InjectRepository(PostContent) private postContentRepo: Repository<PostContent>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(CategoryWithCount) private categoryWithCountRepo: Repository<CategoryWithCount>,
    @InjectRepository(PostView) private postViewRepo: Repository<PostView>,
    @InjectRepository(TagCountView) private tagCountViewRepo: Repository<TagCountView>,
  ) {}

  async createBlogPost(payload: PostDto) {
    const { tag, content, index, category, ...attrs } = payload;
    let categoryObj = await this.categoryRepo.findOneBy({ category: category });
    if (!categoryObj) {
      categoryObj = this.categoryRepo.create({ category: category });
      await this.categoryRepo.save(categoryObj);
    }

    const result = this.postRepo.create(attrs);
    result.post_tag = await this.createTag(tag);
    result.category = categoryObj;
    result.post_content = this.postContentRepo.create({ content, index });
    return await this.postRepo.save(result);
  }

  async getBlogPost(page: number) {
    return await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.post_tag', 'pt')
      .leftJoin('pt.tag', 't')
      .groupBy('post.id, post.created_at')
      .orderBy('post.created_at', 'DESC')
      .select('post.id, post.title, post.preview_content, post.preview_image, post.created_at')
      .addSelect('array_agg(pt."tagTag") as Tag')
      .addSelect('array_agg(t.bg_color) as bg_color')
      .addSelect('array_agg(t.text_color) as text_color')
      .where('post.visible = true')
      .offset((page - 1) * 16)
      .limit(16)
      .getRawMany();
  }

  async getBlogPostAll(page: number) {
    return await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.post_tag', 'pt')
      .leftJoin('pt.tag', 't')
      .groupBy('post.id, post.created_at')
      .orderBy('post.created_at', 'DESC')
      .select('post.id, post.title, post.preview_content, post.preview_image, post.created_at')
      .addSelect('array_agg(pt."tagTag") as Tag')
      .addSelect('array_agg(t.bg_color) as bg_color')
      .addSelect('array_agg(t.text_color) as text_color')
      .offset((page - 1) * 16)
      .limit(16)
      .getRawMany();
  }

  async getAllCategory() {
    return await this.categoryWithCountRepo.find();
  }
  async getCategoryBlogPost(category: string, page: number) {
    return await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.post_tag', 'pt')
      .leftJoin('pt.tag', 't')
      .leftJoin('post.category', 'c')
      .where('c.category = :category', { category })
      .andWhere('post.visible = true')
      .groupBy('post.id, post.created_at')
      .orderBy('post.created_at', 'DESC')
      .select('post.id, post.title, post.preview_content, post.preview_image, post.created_at')
      .addSelect('array_agg(pt."tagTag") as Tag')
      .addSelect('array_agg(t.bg_color) as bg_color')
      .addSelect('array_agg(t.text_color) as text_color')
      .offset((page - 1) * 16)
      .limit(16)
      .getRawMany();
  }

  async getNearPostList(id: string) {
    const currentPost = await this.postRepo.findOne({ where: { id }, relations: ['category'] });
    const afterPost = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.category', 'c')
      .where('c.category = :category', { category: currentPost.category.category })
      .andWhere('post.visible = true')
      .andWhere('post.created_at > :created_at', { created_at: currentPost.created_at })
      .andWhere('post.id != :postId', { postId: currentPost.id })
      .groupBy('post.id, post.created_at')
      .orderBy('post.created_at', 'ASC')
      .select('post.id, post.title, post.created_at')
      .limit(2)
      .getRawMany();

    const beforePost = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.category', 'c')
      .where('c.category = :category', { category: currentPost.category.category })
      .andWhere('post.visible = true')
      .andWhere('post.created_at < :created_at', { created_at: currentPost.created_at })
      .groupBy('post.id, post.created_at')
      .orderBy('post.created_at', 'DESC')
      .select('post.id, post.title, post.created_at')
      .limit(2)
      .getRawMany();
    return { after: afterPost.reverse(), before: beforePost };
  }

  async getContentBlogPost(id: string) {
    return await this.postViewRepo.findOneBy({ id });
  }

  async createTag(tags: string[]) {
    return await Promise.all(
      tags.map(async (value) => {
        const foundTag = await this.tagRepo.findOne({ where: { tag: value } });
        if (foundTag) return this.postTagRepo.create({ tag: foundTag });
        else {
          const newTag = this.tagRepo.create({ tag: value, ...generateColorStyle() });
          await this.tagRepo.save(newTag);
          return this.postTagRepo.create({ tag: newTag });
        }
      }),
    );
  }

  async updateBlogPost(id: string, payload: PostUpdateDto) {
    const result = await this.postRepo.findOne({ where: { id }, relations: ['post_tag', 'post_content', 'category'] });
    if (!result) throw new NotFoundException('Post not found');
    const { tag, content, category, ...attrs } = payload;
    if (tag) {
      result.post_tag = await this.createTag(tag);
    }
    if (content) {
      result.post_content = this.postContentRepo.create({ content });
    }
    if (category) {
      result.category = this.categoryRepo.create({ category: category });
    }
    Object.assign(result, attrs);
    return await this.postRepo.save(result);
  }

  async getTagRanks() {
    return await this.tagCountViewRepo.find({ take: 16 });
  }
}
