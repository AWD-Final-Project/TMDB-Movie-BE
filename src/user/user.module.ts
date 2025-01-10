// user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { GoogleStrategy } from 'src/helpers/google.strategy.helper';
import { GoogleAuthGuard } from 'src/helpers/google.guard.helper';
import { SessionModule } from 'src/session/session.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Movie, MovieSchema } from 'src/movie/schemas/movie.schema';
import { MovieService } from 'src/movie/movie.service';
import { HttpModule } from '@nestjs/axios';
import { DayTrendingMovie, DayTrendingMovieSchema } from 'src/movie/schemas/day-trending-movie.schema';
import { WeekTrendingMovie, WeekTrendingMovieSchema } from 'src/movie/schemas/week-trending-movie.schema';
import { Genre, GenreSchema } from 'src/movie/schemas/genre.schema';
import { FavoriteMovie, FavoriteMovieSchema } from './schemas/favorite-movie.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register User schema here
        MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]), // Register movie schema here
        MongooseModule.forFeature([{ name: DayTrendingMovie.name, schema: DayTrendingMovieSchema }]),
        MongooseModule.forFeature([{ name: WeekTrendingMovie.name, schema: WeekTrendingMovieSchema }]),
        MongooseModule.forFeature([{ name: Genre.name, schema: GenreSchema }]),
        MongooseModule.forFeature([{ name: FavoriteMovie.name, schema: FavoriteMovieSchema }]), // Register FavoriteMovie schema here
        SessionModule,
        HttpModule,
    ],
    providers: [UserService, GoogleStrategy, GoogleAuthGuard, AuthService, JwtService, MovieService],
    controllers: [UserController],
    exports: [UserService], // Export UserService if it's used in other modules
})
export class UserModule {}
