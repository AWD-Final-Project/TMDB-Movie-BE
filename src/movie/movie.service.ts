import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { SearchMoviesQuery } from './dto/search-movies-query.dto';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MovieService {
    private readonly baseUrl: string;
    private readonly token: string;
    private readonly options: any;
    private genresMap: Map<number, string> = new Map();

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
        @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    ) {
        this.baseUrl = this.configService.get<string>('movieApiUrl');
        this.token = this.configService.get<string>('movieApiToken');
        this.options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${this.token}`,
            },
        };
        this.fetchGenres();
    }
    async fetchToDayTrendingMovies() {
        const response = await lastValueFrom(
            this.httpService.get(`${this.baseUrl}/3/trending/movie/day?language=en-US`, this.options),
        );
        const movies = response.data.results.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids),
            };
        });

        return movies;
    }

    async fetchThisWeekTrendingMovies() {
        const response = await lastValueFrom(
            this.httpService.get(`${this.baseUrl}/3/trending/movie/week?language=en-US`, this.options),
        );
        const movies = response.data.results.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids),
            };
        });

        return movies;
    }

    async fetchMovieDetails(movieId: string) {
        const movieIdInt = parseInt(movieId, 10);
        if (isNaN(movieIdInt)) {
            throw new Error('Invalid movie ID');
        }
        const response = await this.movieModel.findOne({ id: movieIdInt });
        return response;
    }

    async searchMovies(query: SearchMoviesQuery): Promise<any> {
        const queryParams = new URLSearchParams({
            query: query.key_word,
            include_adult: query.include_adult?.toString() || 'false',
            language: query.language || 'en-US',
            primary_release_year: query.primary_release_year?.toString() || '',
            page: query.page?.toString() || '1',
            region: query.region || '',
            year: query.year?.toString() || '',
        });

        const response = await lastValueFrom(
            this.httpService.get(`${this.baseUrl}/3/search/movie?${queryParams.toString()}`, this.options),
        );
        const movies = response.data.results.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids),
            };
        });

        return movies;
    }
    private async fetchGenres() {
        const response = await lastValueFrom(
            this.httpService.get(`${this.baseUrl}/3/genre/movie/list?language=en-US`, this.options),
        );
        const genres = response.data.genres;
        genres.forEach((genre: { id: number; name: string }) => {
            this.genresMap.set(genre.id, genre.name);
        });
    }

    private mapGenres(genreIds: number[]): string[] {
        return genreIds.map(id => this.genresMap.get(id) || 'Unknown');
    }
}
