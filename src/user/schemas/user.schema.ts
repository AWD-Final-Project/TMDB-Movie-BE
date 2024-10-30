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
}

export const UserSchema = SchemaFactory.createForClass(User);

// // user.schema.ts
// import { Schema, Document } from 'mongoose';

// export const UserSchema = new Schema(
//     {
//         name: String,
//         email: String,
//         password: String,
//     },
//     {
//         timestamps: true,
//         collection: 'Users',
//     },
// );

// export interface User extends Document {
//     name: string;
//     email: string;
//     password: string;
//     createdAt: Date;
//     updatedAt: Date;
// }
