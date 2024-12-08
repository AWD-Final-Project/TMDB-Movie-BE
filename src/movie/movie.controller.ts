import { BadRequestException, Controller, Get } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('trending/today')
  async getTrendingMovies() {
    try{
      const trendingMoviesData= await this.movieService.getToDayTrendingMovies();
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
    const trendingMoviesData= await this.movieService.getThisWeekTrendingMovies();
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
}
