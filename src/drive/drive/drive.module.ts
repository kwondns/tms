import { Module, OnModuleInit } from '@nestjs/common';
import { DriveController } from '@/drive/drive/drive.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '@/drive/drive/entities/file.entity';
import { Folder } from '@/drive/drive/entities/folder.entity';
import { Permission } from '@/drive/drive/entities/permission.entity';
import { UserService } from '@/drive/user/services/user.service';
import { EmailAuth } from '@/drive/user/entities/email-auth.entity';
import { User } from '@/drive/user/entities/user.entity';
import { Agreement } from '@/drive/user/entities/agreement.entity';
import { Token } from '@/drive/user/entities/token.entity';
import { EmailAuthService } from '@/drive/user/services/email-auth.service';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { UserStorage } from '@/drive/user/entities/user-storage.entity';
import { S3Service } from '@/drive/s3/s3.service';
import { DriveQueue } from '@/drive/drive/drive.queue';
import { BullModule, BullRegistrar } from '@nestjs/bullmq';
import { WorksheetService } from '@/drive/worksheet/worksheet.service';
import { Worksheet } from '@/drive/worksheet/entities/worksheet.entity';
import { DriveDeleteProcessor, DriveDownloadProcessor } from '@/drive/drive/drive.processor';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import { DriveUpdateService } from '@/drive/drive/services/drive.update.service';
import { DriveDeleteService } from '@/drive/drive/services/drive.delete.service';
import { PermissionService } from '@/drive/permission/permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      Folder,
      Permission,
      UserStorage,
      EmailAuth,
      User,
      Agreement,
      Token,
      FileSystem,
      Folder,
      File,
      Worksheet,
    ]),
    BullModule.registerQueue({
      name: 'delete-drive',
    }),
    BullModule.registerQueue({
      name: 'download',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [DriveController],
  providers: [
    DriveReadService,
    DriveCreateService,
    DriveUpdateService,
    DriveDeleteService,
    DriveQueue,
    DriveDeleteProcessor,
    DriveDownloadProcessor,
    UserService,
    EmailAuthService,
    S3Service,
    WorksheetService,
    PermissionService,
  ],
  exports: [DriveCreateService, DriveQueue],
})
export class DriveModule implements OnModuleInit {
  constructor(private readonly bullRegistrar: BullRegistrar) {}

  async onModuleInit() {
    this.bullRegistrar.register(); // ✅ 수동 등록 실행
  }
}
