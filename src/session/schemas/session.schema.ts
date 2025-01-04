import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true, collection: 'Sessions' })
export class Session extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: string;

    @Prop({
        type: {
            loggedInAt: { type: Date, default: Date.now() },
            loggedOutAt: { type: Date },
            refreshToken: { type: String },
        },
        default: {},
    })
    lastLogin: object;

    @Prop({
        type: [
            {
                loggedInAt: { type: Date, default: Date.now() },
                loggedOutAt: { type: Date },
                refreshToken: { type: String },
            },
        ],
        default: [],
    })
    loginHistory: Array<object>;
    @Prop({
        type: {
            code: { type: String, default: '' },
            expiredAt: { type: Date, default: Date.now },
        },
        default: {},
    })
    otp: object;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
