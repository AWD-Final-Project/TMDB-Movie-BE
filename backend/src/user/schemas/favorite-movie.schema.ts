// filepath: /d:/HK1 2024-2025/Advanced Web Programming/FinalProject/TMDB-Movie-BE/src/movie/schemas/favorite-movie.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteMovieDocument = FavoriteMovie & Document;

@Schema({ timestamps: true, collection: 'FavoriteMovies' })
export class FavoriteMovie extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Movie' }], default: [] })
    favorites: Types.ObjectId[];
}

export const FavoriteMovieSchema = SchemaFactory.createForClass(FavoriteMovie);
