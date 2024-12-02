import { envs } from 'src/config/envs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthEventService } from './auth.events.service';
import { AuthUserService } from './auth.user.service';
import { AuthBranchService } from './auth.branch.service';
import { AuthUserController } from './auth.user.controller';
import { AuthBranchController } from './auth.branch.controller';
import { TransportModule } from 'src/transport/transport.module';
import { AuthGoogle } from './auth.google.service';

@Module({
  controllers: [AuthUserController, AuthBranchController],
  providers: [AuthUserService, AuthBranchService, AuthEventService, AuthGoogle],
  imports: [
    TransportModule,
    JwtModule.register({
      global: true,
      secret: envs.jwt_constants,
      signOptions: { expiresIn: '7d' },
    }),
  ],
})
export class AuthModule {}
