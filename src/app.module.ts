import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TransportModule } from './transport/transport.module';
import { AdminModule } from './admin/admin.module';
import { AdminBusinessModule } from './admin-business/admin-business.module';
import { AdminBranchModule } from './admin-branch/admin-branch.module';
import { ExecutiveModule } from './executive/executive.module';

@Module({
  imports: [
    AuthModule,
    TransportModule,
    AdminModule,
    AdminBusinessModule,
    AdminBranchModule,
    ExecutiveModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
