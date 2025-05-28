import { Module } from '@nestjs/common';
import { AdminBranchController } from './admin-branch.controller';
import { AdminBranchService } from './admin-branch.service';
import { HashPasswordService } from 'src/common/utils/hash-password.service';

@Module({
  controllers: [AdminBranchController],
  providers: [AdminBranchService, HashPasswordService],
})
export class AdminBranchModule {}
