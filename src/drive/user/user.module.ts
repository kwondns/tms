import { Module } from '@nestjs/common';
import { UserService } from '@/drive/user/services/user.service';
import { UserController } from '@/drive/user/controllers/user.controller';
import { User } from '@/drive/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAuth } from '@/drive/user/entities/email-auth.entity';
import { EmailAuthController } from '@/drive/user/controllers/email-auth.controller';
import { EmailAuthService } from '@/drive/user/services/email-auth.service';
import { Agreement } from '@/drive/user/entities/agreement.entity';
import { Token } from '@/drive/user/entities/token.entity';
import { TokenService } from '@/drive/user/services/token.service';
import { PasswordReset } from '@/drive/user/entities/password-reset.entity';
import { S3Service } from '@/drive/s3/s3.service';
import { UserStorage } from '@/drive/user/entities/user-storage.entity';
import { FileSystem } from '@/drive/drive/entities/file-system.entity';
import { DriveQueue } from '@/drive/drive/drive.queue';
import { BullModule } from '@nestjs/bullmq';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import { DriveReadService } from '@/drive/drive/services/drive.read.service';
import { DriveUpdateService } from '@/drive/drive/services/drive.update.service';
import { DriveDeleteService } from '@/drive/drive/services/drive.delete.service';
import { PermissionService } from '@/drive/permission/permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailAuth, Agreement, Token, PasswordReset, UserStorage, FileSystem]),
    BullModule.registerQueue({
      name: 'delete-drive',
    }),
    BullModule.registerQueue({
      name: 'download',
    }),
  ],
  controllers: [UserController, EmailAuthController],
  providers: [
    UserService,
    EmailAuthService,
    TokenService,
    S3Service,
    DriveReadService,
    DriveCreateService,
    DriveUpdateService,
    DriveDeleteService,
    DriveQueue,
    PermissionService,
  ],
  exports: [UserService, TokenService],
})
export class UserModule {}
