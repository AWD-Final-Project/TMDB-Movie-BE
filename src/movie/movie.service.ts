import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SearchMoviesQuery } from './dto/search-movies-query.dto';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DayTrendingMovie } from './schemas/day-trending-movie.schema';
import { Genre } from './schemas/genre.schema';
import { WeekTrendingMovie } from './schemas/week-trending-movie.schema';

@Injectable()
export class MovieService {
    private readonly baseUrl: string;
    private readonly token: string;
    private readonly options: any;
    private genresMap: Map<number, string> = new Map();

    constructor(
        private httpService: HttpService,
        @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
        @InjectModel(DayTrendingMovie.name) private readonly dayTrendingMovieModel: Model<DayTrendingMovie>,
        @InjectModel(WeekTrendingMovie.name) private readonly weekTrendingMovieModel: Model<WeekTrendingMovie>,
        @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
    ) {
        this.fetchGenres();
    }
    async fetchToDayTrendingMovies() {
        const dayTrendingMovies = await this.dayTrendingMovieModel.find().limit(10).lean();
        const movies = dayTrendingMovies.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids),
            };
        });

        return movies;
    }

    async fetchThisWeekTrendingMovies() {
        const weekTrendingMovies = await this.weekTrendingMovieModel.find().limit(10).lean();
        const movies = weekTrendingMovies.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids),
            };
        });

        return movies;
    }

    async fetchMovieDetails(movieId: number) {
        const response = await this.movieModel.findOne({ tmdb_id: movieId });
        if (!response) {
            throw new Error('Movie not found');
        }
        return response;
    }

    async searchMovies(query: SearchMoviesQuery): Promise<any> {
        const limit = query.limit || 10;
        const page = query.page || 1;
        const skip = (page - 1) * limit;

        const movies = await this.movieModel
            .find({ title: { $regex: query.key_word, $options: 'i' } })
            .skip(skip)
            .limit(limit);

        const total = await this.movieModel.countDocuments({ title: { $regex: query.key_word, $options: 'i' } });

        return {
            movies,
            pagination: {
                total,
                page,
                limit,
            },
        };
    }

    private async fetchGenres() {
        const genres = await this.genreModel.find();
        genres.forEach((genre: { id: number; name: string }) => {
            this.genresMap.set(genre.id, genre.name);
        });
    }

    private mapGenres(genreIds: number[]): string[] {
        return genreIds.map(id => this.genresMap.get(id) || 'Unknown');
    }
}
