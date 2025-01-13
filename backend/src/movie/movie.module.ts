import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { HttpModule } from '@nestjs/axios';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DayTrendingMovie, DayTrendingMovieSchema } from './schemas/day-trending-movie.schema';
import { Genre, GenreSchema } from './schemas/genre.schema';
import { WeekTrendingMovie, WeekTrendingMovieSchema } from './schemas/week-trending-movie.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
        MongooseModule.forFeature([{ name: DayTrendingMovie.name, schema: DayTrendingMovieSchema }]),
        MongooseModule.forFeature([{ name: WeekTrendingMovie.name, schema: WeekTrendingMovieSchema }]),
        MongooseModule.forFeature([{ name: Genre.name, schema: GenreSchema }]),
        HttpModule,
    ],
    controllers: [MovieController],
    providers: [MovieService],
})
export class MovieModule {}
