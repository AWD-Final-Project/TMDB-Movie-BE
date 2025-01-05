import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, collection: 'Movies' })
export class Movie extends Document {
    @Prop({ required: true, unique: true })
    tmdbId: number;

    @Prop({ default: false })
    adult: boolean;

    @Prop({ default: '' })
    backdropPath: string;

    @Prop({
        type: {
            id: { type: Number },
            name: { type: String },
            posterPath: { type: String },
            backdropPath: { type: String },
        },
        default: null,
    })
    belongsToCollection: {
        id: number;
        name: string;
        posterPath: string;
        backdropPath: string;
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
    imdbId: string;

    @Prop({ type: [String], default: [] })
    originCountry: string[];

    @Prop({ required: true })
    originalLanguage: string;

    @Prop({ required: true })
    originalTitle: string;

    @Prop({ default: '' })
    overview: string;

    @Prop({ default: 0 })
    popularity: number;

    @Prop({ default: '' })
    posterPath: string;

    @Prop({
        type: [
            {
                id: { type: Number },
                logoPath: { type: String },
                name: { type: String },
                originCountry: { type: String },
            },
        ],
        default: [],
    })
    productionCompanies: {
        id: number;
        logoPath: string;
        name: string;
        originCountry: string;
    }[];

    @Prop({
        type: [
            {
                iso31661: { type: String },
                name: { type: String },
            },
        ],
        default: [],
    })
    productionCountries: {
        iso31661: string;
        name: string;
    }[];

    @Prop({ required: true })
    releaseDate: string;

    @Prop({ default: 0 })
    revenue: number;

    @Prop({ default: 0 })
    runtime: number;

    @Prop({
        type: [
            {
                englishName: { type: String },
                iso6391: { type: String },
                name: { type: String },
            },
        ],
        default: [],
    })
    spokenLanguages: {
        englishName: string;
        iso6391: string;
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
    voteAverage: number;

    @Prop({ default: 0 })
    voteCount: number;

    @Prop({
        type: {
            id: { type: Number },
            cast: [
                {
                    adult: { type: Boolean },
                    gender: { type: Number },
                    id: { type: Number },
                    knownForDepartment: { type: String },
                    name: { type: String },
                    originalName: { type: String },
                    popularity: { type: Number },
                    profilePath: { type: String },
                    castId: { type: Number },
                    character: { type: String },
                    creditId: { type: String },
                    order: { type: Number },
                },
            ],
            crew: [
                {
                    adult: { type: Boolean },
                    gender: { type: Number },
                    id: { type: Number },
                    knownForDepartment: { type: String },
                    name: { type: String },
                    originalName: { type: String },
                    popularity: { type: Number },
                    profilePath: { type: String },
                    creditId: { type: String },
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
            knownForDepartment: string;
            name: string;
            originalName: string;
            popularity: number;
            profilePath: string;
            castId: number;
            character: string;
            creditId: string;
            order: number;
        }[];
        crew: {
            adult: boolean;
            gender: number;
            id: number;
            knownForDepartment: string;
            name: string;
            originalName: string;
            popularity: number;
            profilePath: string;
            creditId: string;
            department: string;
            job: string;
        }[];
    };
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
