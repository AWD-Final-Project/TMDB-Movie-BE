// filepath: /d:/HK1 2024-2025/Advanced Web Programming/FinalProject/TMDB-Movie-BE/src/cast/cast.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cast, CastDocument } from './schema/cast.schema';
import { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
@Injectable()
export class CastService {
    constructor(@InjectModel(Cast.name) private readonly castModel: Model<CastDocument>) {}

    async getCastById(id: string): Promise<any> {
        const data = await this.castModel.findOne({ _id: new ObjectId(id) }).lean();
        return data;
    }
}
