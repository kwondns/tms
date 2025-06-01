import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Permission, PermissionRole } from '@/drive/drive/entities/permission.entity';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { UserPermission } from '@/drive/drive/entities/user-permission.entity';
import asyncPipe from '@/utils/asyncPipe';

type CreatePermissionType = {
  queryRunner: QueryRunner;
  role: PermissionRole;
  fileSystem: FileSystem;
  permission: Permission;
  userPermission: UserPermission;
};

@Injectable()
export class PermissionService {
  constructor() {}

  /**
   * Permission 생성
   * 파일시스템과 연결된 퍼미션
   *
   * @param dto
   */
  async newPermission(dto: CreatePermissionType) {
    const { queryRunner, role, fileSystem } = dto;
    return {
      permission: queryRunner.manager.create(Permission, {
        role,
        file_system: fileSystem,
      }),
      ...dto,
    };
  }

  /**
   * UserPermission 생성
   * 유저와 연결된 퍼미션
   *
   * @param dto
   */
  async newUserPermission(dto: CreatePermissionType) {
    const { queryRunner, fileSystem, permission } = dto;
    return {
      userPermission: queryRunner.manager.create(UserPermission, {
        user: fileSystem.owner,
        permission,
        granted_at: new Date(),
      }),
      ...dto,
    };
  }

  async savePermission(dto: CreatePermissionType) {
    const { queryRunner, permission } = dto;
    await queryRunner.manager.save(permission);
    return dto;
  }

  async saveUserPermission(dto: CreatePermissionType) {
    const { queryRunner, userPermission } = dto;
    await queryRunner.manager.save(userPermission);
    return dto;
  }

  async createPermissionPipeline(queryRunner: QueryRunner, role: PermissionRole, fileSystem: FileSystem) {
    const pipeline = await asyncPipe(
      this.newPermission.bind(this),
      this.savePermission.bind(this),
      this.newUserPermission.bind(this),
      this.saveUserPermission.bind(this),
    );
    return pipeline({ fileSystem, role, queryRunner });
  }

  // 다중 사용자 권한 부여 확장 예시
  // async bulkAddPermissions(
  //   queryRunner: QueryRunner,
  //   permission: Permission,
  //   users: User[]
  // ) {
  //   const userPermissions = users.map(user =>
  //     queryRunner.manager.create(UserPermission, {
  //       user,
  //       permission,
  //       grantedAt: new Date()
  //     })
  //   );
  //   await queryRunner.manager.save(userPermissions);
  // }
}
