import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { SessionModule } from './session/session.module';
import { MovieModule } from './movie/movie.module';
import tmdbConfig from './configs/tmdb.config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [tmdbConfig] }),
        MongooseModule.forRoot(process.env.DATABASE_URI),
        UserModule,
        SessionModule,
        MovieModule,
    ],
    controllers: [AppController, UserController],
    providers: [AppService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({ path: 'user/profile', method: RequestMethod.GET });
        consumer.apply(AuthMiddleware).forRoutes({ path: 'user/logout', method: RequestMethod.GET });
        consumer.apply(AuthMiddleware).forRoutes({ path: 'user/invoke-new-token', method: RequestMethod.POST });
        consumer.apply(AuthMiddleware).forRoutes({ path: 'verify/reset-password', method: RequestMethod.POST });
    }
}
