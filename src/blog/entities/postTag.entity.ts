import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tag } from './tag.entity';
import { Post } from './post.entity';

@Entity({ schema: 'blog' })
export class PostTag {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Post, (post) => post.post_tag)
  post: Post;

  @ManyToOne(() => Tag, (tag) => tag.post_tag)
  tag: Tag;
}
