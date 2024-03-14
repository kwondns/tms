import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      if (origin && origin.endsWith('kwondns.site')) callback(null, true);
      else callback(null, false);
    },
    methods: ['GET', 'PATCH', 'DELETE', 'POST', 'PUT'],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
