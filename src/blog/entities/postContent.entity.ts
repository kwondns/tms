import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity({ schema: 'blog' })
export class PostContent {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => Post, (post) => post.post_content)
  post: Post;

  @Column()
  content: string;

  @Column({ type: 'jsonb' })
  index: string;
}
