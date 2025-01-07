import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { MovieModule } from './movie/movie.module';
import { CastModule } from './cast/cast.module';
import tmdbConfig from './configs/tmdb.config';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [tmdbConfig] }),
        MongooseModule.forRoot(process.env.DATABASE_URI),
        UserModule,
        SessionModule,
        MovieModule,
        AuthModule,
        CastModule,
    ],
    controllers: [AppController, UserController],
    providers: [AppService],
})
export class AppModule {}
