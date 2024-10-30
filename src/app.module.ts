import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRoot(process.env.DATABASE_URI), UserModule],
    controllers: [AppController, UserController],
    providers: [AppService],
})
export class AppModule {}
