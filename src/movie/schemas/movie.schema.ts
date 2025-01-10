import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, collection: 'Movies' })
export class Movie extends Document {
    @Prop({ required: true, unique: true })
    tmdb_id: number;

    @Prop({ default: false })
    adult: boolean;

    @Prop({ default: '' })
    backdrop_path: string;

    @Prop({
        type: {
            id: { type: Number },
            name: { type: String },
            poster_path: { type: String },
            backdrop_path: { type: String },
        },
        default: null,
    })
    belongs_to_collection: {
        id: number;
        name: string;
        poster_path: string;
        backdrop_path: string;
    };

    @Prop({ default: 0 })
    budget: number;

    @Prop({ type: [String], default: [] })
    categories: string[];

    @Prop({
        type: [
            {
                id: { type: Number },
                name: { type: String },
            },
        ],
        default: [],
    })
    genres: { id: number; name: string }[];

    @Prop({ default: '' })
    homepage: string;

    @Prop({ required: true })
    imdb_id: string;

    @Prop({ type: [String], default: [] })
    origin_country: string[];

    @Prop({ required: true })
    original_language: string;

    @Prop({ required: true })
    original_title: string;

    @Prop({ default: '' })
    overview: string;

    @Prop({ default: 0 })
    popularity: number;

    @Prop({ default: '' })
    poster_path: string;

    @Prop({
        type: [
            {
                id: { type: Number },
                logo_path: { type: String },
                name: { type: String },
                origin_country: { type: String },
            },
        ],
        default: [],
    })
    production_companies: {
        id: number;
        logo_path: string;
        name: string;
        origin_country: string;
    }[];

    @Prop({
        type: [
            {
                iso_3166_1: { type: String },
                name: { type: String },
            },
        ],
        default: [],
    })
    production_countries: {
        iso_3166_1: string;
        name: string;
    }[];

    @Prop({ required: true })
    release_date: string;

    @Prop({ default: 0 })
    revenue: number;

    @Prop({ default: 0 })
    runtime: number;

    @Prop({
        type: [
            {
                english_name: { type: String },
                iso_639_1: { type: String },
                name: { type: String },
            },
        ],
        default: [],
    })
    spoken_languages: {
        english_name: string;
        iso_639_1: string;
        name: string;
    }[];

    @Prop({ default: '' })
    status: string;

    @Prop({ default: '' })
    tagline: string;

    @Prop({ required: true })
    title: string;

    @Prop({ default: false })
    video: boolean;

    @Prop({ default: 0 })
    vote_average: number;

    @Prop({ default: 0 })
    vote_count: number;

    @Prop({
        type: {
            id: { type: Number },
            cast: [
                {
                    adult: { type: Boolean },
                    gender: { type: Number },
                    id: { type: Number },
                    known_for_department: { type: String },
                    name: { type: String },
                    original_name: { type: String },
                    popularity: { type: Number },
                    profile_path: { type: String },
                    cast_id: { type: Number },
                    character: { type: String },
                    credit_id: { type: String },
                    order: { type: Number },
                },
            ],
            crew: [
                {
                    adult: { type: Boolean },
                    gender: { type: Number },
                    id: { type: Number },
                    known_for_department: { type: String },
                    name: { type: String },
                    original_name: { type: String },
                    popularity: { type: Number },
                    profile_path: { type: String },
                    credit_id: { type: String },
                    department: { type: String },
                    job: { type: String },
                },
            ],
        },
        default: null,
    })
    credits: {
        id: number;
        cast: {
            adult: boolean;
            gender: number;
            id: number;
            known_for_department: string;
            name: string;
            original_name: string;
            popularity: number;
            profile_path: string;
            cast_id: number;
            character: string;
            credit_id: string;
            order: number;
        }[];
        crew: {
            adult: boolean;
            gender: number;
            id: number;
            known_for_department: string;
            name: string;
            original_name: string;
            popularity: number;
            profile_path: string;
            credit_id: string;
            department: string;
            job: string;
        }[];
    };

    @Prop({
        type: [
            {
                iso_639_1: { type: String },
                iso_3166_1: { type: String },
                name: { type: String },
                key: { type: String },
                site: { type: String },
                size: { type: Number },
                type: { type: String },
                official: { type: Boolean },
                published_at: { type: Date },
                id: { type: String },
            },
        ],
        default: [],
    })
    trailers: {
        iso_639_1: string;
        iso_3166_1: string;
        name: string;
        key: string;
        site: string;
        size: number;
        type: string;
        official: boolean;
        published_at: Date;
        id: string;
    }[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
