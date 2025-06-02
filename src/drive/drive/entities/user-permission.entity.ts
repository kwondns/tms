import { User } from '@/drive/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from '@/drive/drive/entities/permission.entity';

/**
 * UserPermission
 * 사용자의 퍼미션을 관리
 *
 * 사용자 + 퍼미션
 */
@Entity({ schema: 'drive' })
export class UserPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.user_permissions, {
    onDelete: 'CASCADE', // 사용자 삭제 시 연결된 권한 자동 제거
  })
  user: User;

  @ManyToOne(() => Permission, (permission) => permission.user_permissions, {
    onDelete: 'CASCADE', // 권한 삭제 시 연결된 사용자 권한 자동 제거
  })
  permission: Permission;

  @CreateDateColumn()
  granted_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;
}
