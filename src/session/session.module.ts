import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]), // Register Session schema here
    ],
    providers: [SessionService],
    controllers: [SessionController],
    exports: [SessionService],
})
export class SessionModule {}
