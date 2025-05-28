import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { FormatDateService } from 'src/common/utils/format-date.service';
import { TicketService } from './utils/ticket.service';

@Module({
  controllers: [ExecutiveController],
  providers: [ExecutiveService, FormatDateService, TicketService],
})
export class ExecutiveModule {}
