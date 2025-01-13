// filepath: /d:/HK1 2024-2025/Advanced Web Programming/FinalProject/TMDB-Movie-BE/src/movie/schemas/favorite-movie.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WatchListMovieDocument = WatchListMovie & Document;

@Schema({ timestamps: true, collection: 'WatchListMovies' })
export class WatchListMovie extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Movie' }], default: [] })
    watch_list: Types.ObjectId[];
}

export const WatchListMovieMovieSchema = SchemaFactory.createForClass(WatchListMovie);
