import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategyHelper } from 'src/helpers/passport/local.strategy.helper';
import { JwtModule } from '@nestjs/jwt';

import { JWT_SECRET } from 'src/configs/secret.config';
import { ACCESS_TOKEN_EXPIRE } from 'src/configs/time.config';
import { JwtStrategyHelper } from 'src/helpers/passport/jwt.strategy.helper';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: ACCESS_TOKEN_EXPIRE },
        }),
    ],
    providers: [AuthService, LocalStrategyHelper, JwtStrategyHelper],
    exports: [AuthService],
})
export class AuthModule {}
