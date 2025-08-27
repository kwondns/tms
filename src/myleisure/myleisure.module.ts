import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/myleisure/entities/user/user.entity';
import { UserAgreement } from '@/myleisure/entities/user/userAgreement.entity';
import { UserAlarm } from '@/myleisure/entities/user/userAlarm.entity';
import { UserAuth } from '@/myleisure/entities/user/userAuth.entity';
import { Archive } from '@/myleisure/entities/user/archive.entity';
import { Alarm } from '@/myleisure/entities/user/alarm.entity';
import { HomeBanner } from '@/myleisure/entities/section/banner.entity';
import { HomeMagazine } from '@/myleisure/entities/section/magazine.entity';
import { SearchTrend } from '@/myleisure/entities/section/searchTrend.entity';
import { Section1, Section2, Section3, Section4, SectionTitle } from '@/myleisure/entities/section/section.entity';
import { Board } from '@/myleisure/entities/board.entity';
import { Leisure } from '@/myleisure/entities/leisure/leisure.entity';
import { LeisureImage } from '@/myleisure/entities/leisure/leisureImage.entity';
import { DefaultLeisure } from '@/myleisure/entities/leisure/defualtLeisure.entity';
import { AuthController } from '@/myleisure/auth/auth.controller';
import { AuthService } from '@/myleisure/auth/auth.service';
import { AuthRepository } from '@/myleisure/auth/auth.repository';
import { ArchiveController } from '@/myleisure/archive/archive.controller';
import { HomeController } from '@/myleisure/home/home.controller';
import { LeisureController } from '@/myleisure/leisure/leisure.controller';
import { SearchController } from '@/myleisure/search/search.controller';
import { ArchiveRepository } from '@/myleisure/archive/archive.repository';
import { HomeRepository } from '@/myleisure/home/home.repository';
import { LeisureRepository } from '@/myleisure/leisure/leisure.repository';
import { SearchRepository } from '@/myleisure/search/search.repository';
import { ArchiveService } from '@/myleisure/archive/archive.service';
import { HomeService } from '@/myleisure/home/home.service';
import { LeisureService } from '@/myleisure/leisure/leisure.service';
import { SearchService } from '@/myleisure/search/search.service';
import { MailService } from '@/myleisure/mail/mail.service';
import { UserToken } from '@/myleisure/entities/user/userToken.entity';
import { UserDeleted } from '@/myleisure/entities/user/userDeleted.entity';
import { NotificationController } from '@/myleisure/notification/notification.controller';
import { NotificationService } from '@/myleisure/notification/notification.service';
import { NotificationRepository } from '@/myleisure/notification/notification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DefaultLeisure,
      Leisure,
      LeisureImage,
      User,
      UserAgreement,
      UserAlarm,
      UserAuth,
      UserToken,
      UserDeleted,
      Section3,
      Section4,
      Archive,
      Alarm,
      HomeBanner,
      HomeMagazine,
      SearchTrend,
      Section1,
      Section2,
      SectionTitle,
      Board,
    ]),
  ],
  controllers: [
    AuthController,
    ArchiveController,
    HomeController,
    LeisureController,
    SearchController,
    NotificationController,
  ],
  providers: [
    AuthService,
    AuthRepository,
    ArchiveService,
    HomeService,
    LeisureService,
    SearchService,
    ArchiveRepository,
    HomeRepository,
    LeisureRepository,
    SearchRepository,
    MailService,
    NotificationService,
    NotificationRepository,
  ],
})
export class MyLeisureModule {}
