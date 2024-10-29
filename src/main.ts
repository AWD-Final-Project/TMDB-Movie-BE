import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
