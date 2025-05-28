import { Controller } from '@nestjs/common';
import { ExecutiveService } from './executive.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('ejecutivo')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @MessagePattern('executive.getCurrentTicket')
  async getCurrentTicket(@Payload() payload: { userId: string }) {
    const { userId } = payload;
    return await this.executiveService.getCurrentTicket(userId);
  }

  @MessagePattern('executive.callNextTicket')
  async callNextTicket(@Payload() payload: { userId: string }) {
    const { userId } = payload;
    return await this.executiveService.callNextTicket(userId);
  }

  @MessagePattern('executive.completeTicket')
  async completeTicket(
    @Payload() payload: { ticketId: string; userId: string },
  ) {
    const { ticketId, userId } = payload;
    return await this.executiveService.completeTicket(ticketId, userId);
  }

  @MessagePattern('executive.markTicketAsAbsent')
  async markTicketAsAbsent(
    @Payload() payload: { ticketId: string; userId: string },
  ) {
    const { ticketId, userId } = payload;
    return await this.executiveService.markTicketAsAbsent(ticketId, userId);
  }
}
