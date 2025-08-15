import { Module } from '@nestjs/common';
import { UserService } from '@/time/user/services/user.service';
import { UserController } from '@/time/user/controllers/user.controller';
import { User } from '@/time/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAuth } from '@/time/user/entities/email-auth.entity';
import { EmailAuthController } from '@/time/user/controllers/email-auth.controller';
import { EmailAuthService } from '@/time/user/services/email-auth.service';
import { Token } from '@/time/user/entities/token.entity';
import { TokenService } from '@/time/user/services/token.service';
import { PasswordReset } from '@/time/user/entities/password-reset.entity';
import { MailService } from '@/time/mail/mail.service';
import { Present } from '@/time/entities/present.entity';
import { PresentService } from '@/time/present/present.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailAuth, Token, PasswordReset, Present])],
  controllers: [UserController, EmailAuthController],
  providers: [UserService, EmailAuthService, TokenService, MailService, PresentService],
  exports: [UserService, TokenService],
})
export class UserModule {}
