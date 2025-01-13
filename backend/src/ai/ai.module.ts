import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from 'src/movie/schemas/movie.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
    providers: [AiService],
    controllers: [AiController],
})
export class AiModule {}
