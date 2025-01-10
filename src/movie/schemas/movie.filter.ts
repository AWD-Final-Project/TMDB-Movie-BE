import { Movie } from './movie.schema';

class MovieFilter {
    static makeBasicFilter(movie: Movie): object {
        return {
            id: movie?._id,
            title: movie?.title,
            overview: movie?.overview,
            release_date: movie?.release_date,
            poster_path: movie?.poster_path,
            backdrop_path: movie?.backdrop_path,
            popularity: movie?.popularity,
            vote_average: movie?.vote_average,
            vote_count: movie?.vote_count,
            genres: movie?.genres,
        };
    }

    static makeDetailFilter(movie: Partial<Movie>): object {
        return {
            id: movie?._id,
            title: movie?.title,
            overview: movie?.overview,
            release_date: movie?.release_date,
            poster_path: movie?.poster_path,
            backdrop_path: movie?.backdrop_path,
            popularity: movie?.popularity,
            vote_average: movie?.vote_average,
            vote_count: movie?.vote_count,
            genres: movie?.genres,
            trailers: movie?.trailers,
        };
    }
}

export default MovieFilter;
