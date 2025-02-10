import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors({
    origin: (origin, callback) => {
      if (origin && (origin.endsWith('kwondns.site') || origin.endsWith('kwondns.com'))) callback(null, true);
      else callback(null, false);
    },
    methods: ['GET', 'PATCH', 'DELETE', 'POST', 'PUT'],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
