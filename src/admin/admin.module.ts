import { Module } from '@nestjs/common';
import { AdminController } from '@/admin/admin.controller';
import { AdminService } from '@/admin/admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '@/admin/admin.entity';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from '@/admin/token.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([Admin]),
  ],
  controllers: [AdminController],
  providers: [AdminService, TokenService],
})
export class AdminModule {}
