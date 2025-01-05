import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type GenreDocument = HydratedDocument<Genre>;

@Schema({ timestamps: true, collection: 'Genres' })
export class Genre extends Document {
    @Prop({ required: true, unique: true })
    tmdb_id: number;

    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    name: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
