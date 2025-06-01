import { Module } from '@nestjs/common';
import { PermissionService } from '@/drive/permission/permission.service';
import { PermissionController } from '@/drive/permission/permission.controller';

@Module({
  providers: [PermissionService],
  exports: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
