import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { PostContent } from '@/blog/entities/postContent.entity';
import { Category } from '@/blog/entities/category.entity';
import { PostTag } from '@/blog/entities/postTag.entity';

@Entity({ schema: 'blog' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  preview_image: string;

  @Column()
  preview_content: string;

  @Column({ type: 'boolean', default: true })
  visible: boolean;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => PostTag, (postTag) => postTag.post, { cascade: true })
  post_tag: PostTag[];

  @OneToOne(() => PostContent, (postContent) => postContent.post, { cascade: true })
  @JoinColumn()
  post_content: PostContent;

  @ManyToOne(() => Category, (category) => category.post)
  category: Category;
}

@ViewEntity({
  schema: 'blog',
  expression: `
      select post.id,
             title,
             post.preview_image,
             post.preview_content,
             post.created_at,
             post.updated_at,
             post.visible,
             c.category,
             pc.content,
             pc.index,
             array_agg(pt."tagTag")  as tag,
             array_agg(t.text_color) as text_color,
             array_agg(t.bg_color)   as bg_color
      from blog.post
               join blog.post_content pc on post."postContentId" = pc.id
               join blog.post_tag pt on post.id = pt."postId"
               join blog.tag t on t.tag = pt."tagTag"
               join blog.category c on c.id = post."categoryId"
      group by c.category, post, title, post.preview_image, post.preview_content,
               post.created_at, post.updated_at, post.id, pc.index, pc.content
      order by post.created_at desc;
  `,
})
export class PostView {
  @ViewColumn()
  id: string;

  @ViewColumn()
  title: string;

  @ViewColumn()
  preview_image: string;

  @ViewColumn()
  preview_content: string;

  @ViewColumn()
  created_at: string;

  @ViewColumn()
  updated_at: string;

  @ViewColumn()
  category: string;

  @ViewColumn()
  content: string;

  @ViewColumn()
  index: string;

  @ViewColumn()
  visible: boolean;

  @ViewColumn()
  tag: string[];

  @ViewColumn()
  text_color: string[];

  @ViewColumn()
  bg_color: string[];
}
