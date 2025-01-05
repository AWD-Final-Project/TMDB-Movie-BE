import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type WeekTrendingMovieDocument = HydratedDocument<WeekTrendingMovie>;

@Schema({ timestamps: true, collection: 'WeekTrendingMovies' })
export class WeekTrendingMovie extends Document {
    @Prop({ required: true, unique: true })
    tmdb_id: number;

    @Prop({ default: false })
    adult: boolean;

    @Prop({ required: true })
    backdrop_path: string;

    @Prop({ type: [String], default: [] })
    categories: string[];

    @Prop({ type: [Number], required: true })
    genre_ids: number[];

    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    media_type: string;

    @Prop({ required: true })
    original_language: string;

    @Prop({ required: true })
    original_title: string;

    @Prop({ required: true })
    overview: string;

    @Prop({ required: true })
    popularity: number;

    @Prop({ required: true })
    poster_path: string;

    @Prop({ required: true })
    release_date: string;

    @Prop({ required: true })
    title: string;

    @Prop({ default: false })
    video: boolean;

    @Prop({ required: true })
    vote_average: number;

    @Prop({ required: true })
    vote_count: number;
}

export const WeekTrendingMovieSchema = SchemaFactory.createForClass(WeekTrendingMovie);
