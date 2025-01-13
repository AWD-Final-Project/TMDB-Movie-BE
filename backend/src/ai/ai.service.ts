import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AIServiceHelper } from 'src/helpers/RAG-LLM/ai.service.helper';
import { Movie } from 'src/movie/schemas/movie.schema';

@Injectable()
export class AiService {
    constructor(@InjectModel(Movie.name) private readonly movieModel: Model<Movie>) {}

    async search(keyword: any, field: string, limit: number = 10): Promise<any> {
        const data = await AIServiceHelper.search(keyword, field, limit);
        if (!data || data.length === 0) {
            return [];
        }

        const movies = await this.movieModel.find({ _id: { $in: data } }).lean();
        return {
            movies: movies,
            meta: {
                field,
                limit,
            },
        };
    }

    async navigate(query: string): Promise<any> {
        const response = await AIServiceHelper.navigate(query);
        const { type, route } = response;
        console.log('Type: ', type);
        switch (type) {
            case 'CAST_PAGE': {
                const movieId = response?.id;
                const foundMovie = await this.movieModel.findById(new Types.ObjectId(movieId)).lean();
                if (!foundMovie) {
                    throw new Error('Movie not found');
                }
                return {
                    movie: foundMovie,
                    route,
                };
            }

            case 'MOVIE_PAGE': {
                const movieId = response?.id;
                const foundMovie = await this.movieModel.findById(new Types.ObjectId(movieId)).lean();
                if (!foundMovie) {
                    throw new Error('Movie not found');
                }
                return {
                    movie: foundMovie,
                    route,
                };
            }

            case 'GENRE_PAGE': {
                const bestMatchGenreId = response?.genre_ids?.length > 0 ? response?.genre_ids[0] : null;
                console.log('bestMatchGenreId: ', bestMatchGenreId);
                const foundMovie = await this.movieModel.findOne({ 'genres.id': bestMatchGenreId }).lean();
                console.log('Found movie with genres: ');
                console.log(foundMovie);
                const keyword = foundMovie?.genres?.find((genre: any) => genre.id === bestMatchGenreId)?.name;
                return {
                    route,
                    keyword,
                };
            }

            default: {
                return {
                    ...response,
                    type: undefined,
                };
            }
        }
    }
}
