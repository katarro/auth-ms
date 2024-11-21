import { Module } from '@nestjs/common';
import { AuthUserService } from './auth.user.service';
import { AuthUserController } from './auth.user.controller';
import { AuthBranchController } from './auth.branch.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthBranchService } from './auth.branch.service';
import { envs } from 'src/config/envs';

@Module({
  controllers: [AuthUserController, AuthBranchController],
  providers: [AuthUserService, AuthBranchService],
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.jwt_constants,
      signOptions: { expiresIn: '7d' },
    }),
  ],
})
export class AuthModule {}
