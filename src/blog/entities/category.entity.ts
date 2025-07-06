import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ViewColumn, ViewEntity } from 'typeorm';
import { Post } from '@/blog/entities/post.entity';

@Entity({ schema: 'blog' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @OneToMany(() => Post, (post) => post.category)
  post: Post[];
}

@ViewEntity({
  schema: 'blog',
  expression: `select category.category, count(category.category)
               from blog.category
                        left join blog.post p on category.id = p."categoryId"
               where p.visible = true
               group by category.category
               order by category ASC
  `,
})
export class CategoryWithCount {
  @ViewColumn()
  category: string;

  @ViewColumn()
  count: number;
}
