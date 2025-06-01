import { Module } from '@nestjs/common';
import { WorksheetService } from '@/drive/worksheet/worksheet.service';
import { WorksheetController } from '@/drive/worksheet/worksheet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worksheet } from '@/drive/worksheet/entities/worksheet.entity';
import { UserService } from '@/drive/user/services/user.service';
import { User } from '@/drive/user/entities/user.entity';
import { EmailAuth } from '@/drive/user/entities/email-auth.entity';
import { Agreement } from '@/drive/user/entities/agreement.entity';
import { Token } from '@/drive/user/entities/token.entity';
import { TokenService } from '@/drive/user/services/token.service';
import { EmailAuthService } from '@/drive/user/services/email-auth.service';
import { PasswordReset } from '@/drive/user/entities/password-reset.entity';
import { UserStorage } from '@/drive/user/entities/user-storage.entity';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { BullModule } from '@nestjs/bullmq';
import { DriveQueue } from '@/drive/drive/drive.queue';
import { WorksheetFileSystem } from '@/drive/drive/entities/worksheet-file-system.entity';
import { S3Service } from '@/drive/s3/s3.service';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import { DriveUpdateService } from '@/drive/drive/services/drive.update.service';
import { DriveDeleteService } from '@/drive/drive/services/drive.delete.service';
import { PermissionService } from '@/drive/permission/permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Worksheet,
      User,
      EmailAuth,
      Agreement,
      Token,
      PasswordReset,
      UserStorage,
      FileSystem,
      WorksheetFileSystem,
    ]),
    BullModule.registerQueue({
      name: 'delete-drive',
    }),
    BullModule.registerQueue({
      name: 'download',
    }),
  ],
  controllers: [WorksheetController],
  providers: [
    WorksheetService,
    UserService,
    TokenService,
    EmailAuthService,
    DriveQueue,
    S3Service,
    DriveReadService,
    DriveCreateService,
    DriveUpdateService,
    DriveDeleteService,
    PermissionService,
  ],
})
export class WorksheetModule {}
