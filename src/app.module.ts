import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRoot(process.env.DATABASE_URI), UserModule],
    controllers: [AppController, UserController],
    providers: [AppService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({ path: 'user/profile', method: RequestMethod.GET });
        consumer.apply(AuthMiddleware).forRoutes({ path: 'user/invoke-new-tokens', method: RequestMethod.GET });
    }
}
