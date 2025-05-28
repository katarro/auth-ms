import { Module } from '@nestjs/common';
import { AdminBusinessService } from './admin-business.service';
import { AdminBusinessController } from './admin-business.controller';
import { FormatDateService } from 'src/common/utils/format-date.service';
import { HashPasswordService } from 'src/common/utils/hash-password.service';

@Module({
  providers: [AdminBusinessService, FormatDateService, HashPasswordService],
  controllers: [AdminBusinessController],
})
export class AdminBusinessModule {}
