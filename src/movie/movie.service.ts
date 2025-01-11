import { HttpService } from '@nestjs/axios';
import { ObjectId } from 'mongodb';
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

    async fetchMovieDetails(movieId: string): Promise<any> {
        const response = await this.movieModel.findOne({ _id: new ObjectId(movieId) }).lean();
        if (!response) {
            throw new Error('Movie not found');
        }
        let youtubeTrailerURL = '';
        if (response.trailers && response.trailers.length > 0) {
            const firstTrailer = response.trailers[0];
            if (firstTrailer.key) {
                youtubeTrailerURL = `https://www.youtube.com/watch?v=${firstTrailer.key}`;
            }
        }

        return {
            ...response,
            youtubeTrailerURL,
        };
    }

    async searchMovies(query: SearchMoviesQuery): Promise<any> {
        const { key_word, language, region, include_adult, year } = query;
        const limit = query.limit || 10;
        const page = query.page || 1;
        const skip = (page - 1) * limit;
        const filter_field = query.filter_field || 'title';

        const filter: any = {
            [filter_field]: { $regex: key_word, $options: 'i' },
        };
        if (language) {
            filter['original_language'] = language;
        }
        if (region) {
            // Handle single or multiple regions dynamically
            filter['origin_country'] = { $in: [region] };
        }
        if (include_adult) {
            filter['adult'] = include_adult;
        }
        if (year) {
            filter['release_date'] = {
                $gte: `${year}-01-01`,
                $lte: `${year}-12-31`,
            };
        }
        const movies = await this.movieModel.find(filter).skip(skip).limit(limit);
        const total = await this.movieModel.countDocuments(filter);

        return {
            movies,
            meta: {
                total,
                totalAmount: movies.length,
                page,
                totalPage: Math.ceil(total / limit),
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

    async fetchPopularMovies(): Promise<any[]> {
        const popularMovies = await this.movieModel.find().sort({ popularity: -1 }).limit(10).lean();
        if (!popularMovies) {
            return [];
        }
        return popularMovies;
    }

    async fetchMovieRecommendationsByGenre(movieId: string): Promise<any[]> {
        const movie = await this.movieModel.findOne({ _id: new ObjectId(movieId) }).lean();
        if (!movie) {
            throw new Error('Movie not found');
        }

        const recommendGenres = movie.genres.map(genre => genre.name);

        const recommendations = await this.movieModel
            .find({
                _id: { $ne: new ObjectId(movieId) }, // Exclude the original movie
                'genres.name': { $in: recommendGenres }, // Match genre names
            })
            .limit(10)
            .lean();
        return recommendations;
    }
}
