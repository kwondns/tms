import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserPermission } from '@/drive/drive/entities/user-permission.entity';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';

export enum PermissionRole {
  VIEWER = 1,
  EDITOR = 2,
  OWNER = 5,
}

/**
 * Permission
 * 파일시스템의 퍼미션 관리
 *
 * 사용자 퍼미션 + 파일시스템
 */
@Entity({ schema: 'drive' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => UserPermission, (userPermission) => userPermission.permission)
  user_permissions: UserPermission[];

  @ManyToOne(() => FileSystem, (fileSystem) => fileSystem.permissions, {
    onDelete: 'CASCADE', // 파일시스템 삭제 시 권한 자동 삭제
    nullable: false,
  })
  file_system: FileSystem;

  @Column({
    type: 'enum',
    enum: PermissionRole,
    default: PermissionRole.VIEWER,
    comment: '1: VIEWER, 2: EDITOR, 5: OWNER',
  })
  role: number;

  @Column({ type: 'jsonb', nullable: true })
  custom_rules: {
    canShare: boolean;
    canDelete: boolean;
    expiresAt?: Date;
  };
}
