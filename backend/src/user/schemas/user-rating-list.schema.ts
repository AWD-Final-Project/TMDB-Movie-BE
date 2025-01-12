// filepath: /d:/HK1 2024-2025/Advanced Web Programming/FinalProject/TMDB-Movie-BE/src/movie/schemas/favorite-movie.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRatingListDocument = UserRatingList & Document;

@Schema({ timestamps: true, collection: 'UserRatingList' })
export class UserRatingList extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({
        type: [{ movie_id: { type: Types.ObjectId, ref: 'Movie' }, rating: { type: Number, min: 0, max: 10 } }],
        default: [],
    })
    rating_list: { movie_id: Types.ObjectId; rating: number }[];
}

export const UserRatingListSchema = SchemaFactory.createForClass(UserRatingList);
