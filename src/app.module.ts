import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [AuthModule, TransportModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
