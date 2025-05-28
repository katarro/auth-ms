import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  CreateBranchAdminCommand,
  CreateBusinessAdminCommand,
} from './command';
import { CreateExecutiveCommand } from './command/create-executive-command';
import { HashPasswordService } from 'src/common/utils/hash-password.service';
import { FormatDateService } from 'src/common/utils/format-date.service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    CreateBusinessAdminCommand,
    CreateBranchAdminCommand,
    CreateExecutiveCommand,
    HashPasswordService,
    FormatDateService,
  ],
})
export class AdminModule {}
