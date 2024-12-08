import { BadRequestException, Controller, Get, Param, Req } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('trending/today')
  async getTrendingMovies() {
    try{
      const trendingMoviesData= await this.movieService.fetchToDayTrendingMovies();
      if (trendingMoviesData){
        return {
          statusCode: 200,
          message: 'Fetched today trending movies successfully',
          data: trendingMoviesData,
        };
      }
      throw new BadRequestException('Failed to get day trending movies');
    }
    catch(error){
      throw new BadRequestException('Get day trending movies error: ' + error.message);
    }
}
@Get('trending/thisweek')
async getThisWeekTrendingMovies() {
  try{
    const trendingMoviesData= await this.movieService.fetchThisWeekTrendingMovies();
    if (trendingMoviesData){
      return {
        statusCode: 200,
        message: 'Fetched this week trending movies successfully',
        data: trendingMoviesData,
      };
    }
    throw new BadRequestException('Failed to get week trending movies');
  }
  catch(error){
    throw new BadRequestException('Get week trending movies error: ' + error.message);
  }
}

@Get(':movie_id')
async getMovieDetails(@Param('movie_id') movieId:string) {
  try{
    if (!movieId){
      throw new BadRequestException('Movie id is required to fetch details');
    }
    const movieDetailsData= await this.movieService.fetchMovieDetails(movieId);
    if (movieDetailsData){
      return {
        statusCode: 200,
        message: 'Fetched movie details successfully',
        data: movieDetailsData,
      };
    }
    throw new BadRequestException('Failed to get movie details');
  }
  catch(error){
    throw new BadRequestException('Get movie details error: ' + error.message);
  }
}
}
