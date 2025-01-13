import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'Users' })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: '' })
    fullname: string;

    @Prop({ default: '' })
    address: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ default: 'inactive' })
    status: string;

    @Prop({ default: 'local' })
    type: string;

    @Prop({ default: '' })
    refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
