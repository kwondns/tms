import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { APP_GUARD } from '@nestjs/core';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([Admin]),
  ],
  controllers: [AdminController],
  providers: [AdminService, TokenService, { provide: APP_GUARD, useClass: AdminGuard }],
})
export class AdminModule {}
