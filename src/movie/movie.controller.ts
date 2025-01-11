import { BadRequestException, Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MovieService } from './movie.service';
import { SearchMoviesQuery } from './dto/search-movies-query.dto';

@Controller('movie')
export class MovieController {
    constructor(private readonly movieService: MovieService) {}

    @Get('trending/today')
    async getTrendingMovies() {
        try {
            const trendingMoviesData = await this.movieService.fetchToDayTrendingMovies();
            if (trendingMoviesData) {
                return {
                    statusCode: 200,
                    message: 'Fetched today trending movies successfully',
                    data: trendingMoviesData,
                };
            }
            throw new BadRequestException('Failed to get day trending movies');
        } catch (error) {
            throw new BadRequestException('Get day trending movies error: ' + error.message);
        }
    }
    @Get('trending/thisweek')
    async getThisWeekTrendingMovies() {
        try {
            const trendingMoviesData = await this.movieService.fetchThisWeekTrendingMovies();
            if (trendingMoviesData) {
                return {
                    statusCode: 200,
                    message: 'Fetched this week trending movies successfully',
                    data: trendingMoviesData,
                };
            }
            throw new BadRequestException('Failed to get week trending movies');
        } catch (error) {
            throw new BadRequestException('Get week trending movies error: ' + error.message);
        }
    }

    @Get('search')
    @UsePipes(new ValidationPipe({ transform: true }))
    async searchMovies(@Query() query: SearchMoviesQuery) {
        try {
            if (!query) {
                throw new BadRequestException('Search query is required');
            }
            const movies = await this.movieService.searchMovies(query);
            if (movies.length === 0) {
                return {
                    statusCode: 404,
                    message: 'No movies found',
                    data: [],
                };
            }
            return {
                statusCode: 200,
                message: 'Search movies successfully',
                data: movies,
            };
        } catch (error) {
            throw new BadRequestException('Search movies error: ' + error.message);
        }
    }

    @Get('popular')
    async getPopularMovies() {
        try {
            const popularMoviesData = await this.movieService.fetchPopularMovies();
            if (popularMoviesData) {
                return {
                    statusCode: 200,
                    message: 'Fetched popular movies successfully',
                    data: popularMoviesData,
                };
            }
            throw new BadRequestException('Failed to get popular movies');
        } catch (error) {
            throw new BadRequestException('Get popular movies error: ' + error.message);
        }
    }

    @Get(':movie_id')
    async getMovieDetails(
        @Param('movie_id') movieId: string,
    ): Promise<{ statusCode: number; message: string; data: any }> {
        try {
            if (!movieId) {
                throw new BadRequestException('Movie id is required to fetch details');
            }

            const movieDetailsData = await this.movieService.fetchMovieDetails(movieId);
            if (movieDetailsData) {
                return {
                    statusCode: 200,
                    message: 'Fetched movie with details successfully',
                    data: movieDetailsData,
                };
            }
            throw new BadRequestException('Not found movie details');
        } catch (error) {
            throw new BadRequestException('Get movie details error: ' + error.message);
        }
    }

    @Get(':movie_id/recommendations')
    async getMovieRecommendations(
        @Param('movie_id') movieId: string,
    ): Promise<{ statusCode: number; message: string; data: any }> {
        try {
            if (!movieId) {
                throw new BadRequestException('Movie id is required to fetch recommendations');
            }

            const movieRecommendationsData = await this.movieService.fetchMovieRecommendationsByGenre(movieId);
            if (movieRecommendationsData) {
                return {
                    statusCode: 200,
                    message: 'Fetched movie recommendations successfully',
                    data: {
                        genreRecommendations: movieRecommendationsData ?? [],
                        AIRecommendations: [],
                    },
                };
            }
            throw new BadRequestException('Not found movie recommendations');
        } catch (error) {
            throw new BadRequestException('Get movie recommendations error: ' + error.message);
        }
    }
}
