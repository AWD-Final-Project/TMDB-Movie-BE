import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import * as passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization',
    });

    app.use(passport.initialize());
    app.useGlobalFilters(new ValidationExceptionFilter());
    console.log(`Server is running on http://localhost:${process.env.PORT ?? 3000}`);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
