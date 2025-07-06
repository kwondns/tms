import { Column, Entity, OneToMany, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { PostTag } from '@/blog/entities/postTag.entity';

@Entity({ schema: 'blog' })
export class Tag {
  @PrimaryColumn()
  tag: string;

  @OneToMany(() => PostTag, (postTag) => postTag.tag)
  post_tag: PostTag[];

  @Column()
  bg_color: string;

  @Column()
  text_color: string;
}

@ViewEntity({
  schema: 'blog',
  expression: `
        select t.tag, count(t.tag) as tag_count, text_color, bg_color
        from blog.tag t
                 join blog.post_tag pt on t.tag = pt."tagTag"
        group by t.tag
        order by count(t.tag) desc
  `,
})
export class TagCountView {
  @ViewColumn()
  tag: string;

  @ViewColumn()
  tag_count: number;

  @ViewColumn()
  bg_color: string;

  @ViewColumn()
  text_color: string;
}
