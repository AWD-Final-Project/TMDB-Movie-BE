import { HttpService } from '@nestjs/axios';
import { Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MovieService {
    private readonly baseUrl: string;
    private readonly token: string;
    private readonly options: any;
    private genresMap: Map<number, string> = new Map();

    constructor(private configService: ConfigService, private httpService: HttpService) {
        this.baseUrl = this.configService.get<string>('movieApiUrl');
        this.token = this.configService.get<string>('movieApiToken');
        this.options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${this.token}`
            }
        };
        this.fetchGenres();
    }
    async getToDayTrendingMovies() {
        const response = await lastValueFrom(this.httpService.get(`${this.baseUrl}/3/trending/movie/day?language=en-US`, this.options));
        const movies = response.data.results.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids)
            };
        });

        return movies;
    }

    async getThisWeekTrendingMovies() {
        const response = await lastValueFrom(this.httpService.get(`${this.baseUrl}/3/trending/movie/week?language=en-US`, this.options));
        const movies = response.data.results.map((movie: any) => {
            const { genre_ids, ...rest } = movie;
            return {
                ...rest,
                genres: this.mapGenres(genre_ids)
            };
        });

        return movies;
    }

    private async fetchGenres() {
        const response = await lastValueFrom(this.httpService.get(`${this.baseUrl}/3/genre/movie/list?language=en-US`, this.options));
        const genres = response.data.genres;
        genres.forEach((genre: { id: number, name: string }) => {
            this.genresMap.set(genre.id, genre.name);
        });
    }

    private mapGenres(genreIds: number[]): string[] {
        return genreIds.map(id => this.genresMap.get(id) || 'Unknown');
    }
}
