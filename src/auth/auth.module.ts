import { envs } from 'src/config/envs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUserService } from './auth.service';
import { AuthUserController } from './auth.controller';
import { TransportModule } from 'src/transport/transport.module';
import { AuthGoogle } from './auth.google.service';
import { IdsCustomerType } from 'src/lib';

@Module({
  controllers: [AuthUserController],
  providers: [AuthUserService, AuthGoogle, IdsCustomerType],
  imports: [
    TransportModule,
    JwtModule.register({
      global: true,
      secret: envs.jwt_constants,
      // Si quiero que el token expire (del cliente), crear un middleware, que rediriga al usuario a la pagina de login
      // signOptions: { expiresIn: '7d' },// No quiero que expire el token
    }),
  ],
})
export class AuthModule {}
