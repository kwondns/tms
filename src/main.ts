import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (origin, callback) => {
            if (origin && origin.endsWith('kwondns.site')) callback(null, true);
            else callback(new Error('Not Allowed Origin!'), false);
          }
        : ['http://localhost:5173'],
    methods: ['GET', 'PATCH', 'DELETE', 'POST', 'PUT'],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
