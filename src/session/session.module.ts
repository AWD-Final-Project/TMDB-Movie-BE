import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { MongooseUtil } from '../utils/mongoose.util';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]), // Register Session schema here
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [SessionService, MongooseUtil],
    controllers: [SessionController],
    exports: [SessionService],
})
export class SessionModule {}
