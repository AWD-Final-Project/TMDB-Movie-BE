// filepath: /d:/HK1 2024-2025/Advanced Web Programming/FinalProject/TMDB-Movie-BE/src/cast/schema/cast.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CastDocument = HydratedDocument<Cast>;

interface MovieCredit {
    adult: boolean;
    backdrop_path: string | null;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    character: string;
    credit_id: string;
    order: number;
}

interface MovieCredits {
    cast: MovieCredit[];
    crew: object[];
    id: number;
}

@Schema({ timestamps: true, collection: 'Casts' })
export class Cast extends Document {
    @Prop({ required: true, unique: true })
    tmdb_id: number;

    @Prop({ default: false })
    adult: boolean;

    @Prop({ type: [String], default: [] })
    also_known_as: string[];

    @Prop({ required: true })
    biography: string;

    @Prop({ required: true })
    birthday: string;

    @Prop({ required: false, default: null })
    deathday: string | null;

    @Prop({ required: true })
    gender: number;

    @Prop({ required: false, default: '' })
    homepage: string;

    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    imdb_id: string;

    @Prop({ required: true })
    known_for_department: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false, default: '' })
    place_of_birth: string;

    @Prop({ required: true })
    popularity: number;

    @Prop({ required: true })
    profile_path: string;

    @Prop({
        type: {
            cast: {
                type: [
                    {
                        adult: { type: Boolean, required: true },
                        backdrop_path: { type: String, required: false, default: null },
                        genre_ids: { type: [Number], required: true },
                        id: { type: Number, required: true },
                        original_language: { type: String, required: true },
                        original_title: { type: String, required: true },
                        overview: { type: String, required: true },
                        popularity: { type: Number, required: true },
                        poster_path: { type: String, required: true },
                        release_date: { type: String, required: true },
                        title: { type: String, required: true },
                        video: { type: Boolean, required: true },
                        vote_average: { type: Number, required: true },
                        vote_count: { type: Number, required: true },
                        character: { type: String, required: false, default: '' },
                        credit_id: { type: String, required: true },
                        order: { type: Number, required: true },
                    },
                ],
                default: [],
            },
            crew: { type: [Object], default: [] },
            id: { type: Number, required: true },
        },
        required: true,
    })
    movie_credits: MovieCredits;
}

export const CastSchema = SchemaFactory.createForClass(Cast);
