// user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { GoogleStrategy } from 'src/helpers/google.strategy.helper';
import { GoogleAuthGuard } from 'src/helpers/google.guard.helper';
import { SessionModule } from 'src/session/session.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register User schema here
        SessionModule,
    ],
    providers: [UserService, GoogleStrategy, GoogleAuthGuard],
    controllers: [UserController],
    exports: [UserService], // Export UserService if it's used in other modules
})
export class UserModule {}
