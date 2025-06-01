import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(passport.initialize());
  app.enableCors({
    origin: (origin, callback) => {
      if (origin?.endsWith('kwondns.com')) callback(null, true);
      else callback(null, true);
    },
    methods: ['GET', 'PATCH', 'DELETE', 'POST', 'PUT'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // DTO를 자동으로 변환
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성 전달 시 예외 발생
      skipUndefinedProperties: true,
    }),
  );
  await app.listen(process.env.PORT);
}
bootstrap();
