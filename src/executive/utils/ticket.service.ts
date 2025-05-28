import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, TicketStatus } from '@prisma/client';

@Injectable()
export class TicketService extends PrismaClient {
  public async getAssignedModule(userId: string) {
    const module = await this.serviceModule.findFirst({
      where: {
        currentExecutiveId: userId,
        isActive: true,
      },
    });

    if (!module) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'No tienes un módulo asignado',
      });
    }

    return module;
  }

  public async validateTicket(
    ticketId: string,
    moduleId: string,
    allowedStatuses: TicketStatus[],
  ) {
    const ticket = await this.queueTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.serviceModuleId !== moduleId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permiso para completar este ticket',
      });
    }

    if (!allowedStatuses.includes(ticket.status)) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'El ticket no está en un estado válido para esta operación',
      });
    }

    return ticket;
  }

  public async markTicketAsCompleted(
    tx: any,
    ticketId: string,
    executiveId: string,
  ) {
    return tx.queueTicket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.COMPLETED,
        endTime: new Date(),
        executiveId,
      },
    });
  }

  public calcTimeInSeconds(start: Date, end?: Date): number {
    if (!start || !end) return 0;
    return (end.getTime() - start.getTime()) / 1000;
  }

  /**
   * Busca un ticket en ambas colas (principal y ausentes) para marcar ausencia
   */
  async findTicketForAbsence(ticketId: string) {
    // Buscar en cola principal primero
    const ticket = await this.queueTicket.findUnique({
      where: { id: ticketId },
    });

    if (ticket) {
      return {
        ticket,
        absentTicket: null,
        isFromAbsentQueue: false,
      };
    }

    // Si no está en cola principal, buscar en cola de ausentes
    const absentTicket = await this.queueTicketAbsent.findUnique({
      where: { id: ticketId },
    });

    if (!absentTicket) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Ticket no encontrado',
      });
    }

    return {
      ticket: null,
      absentTicket,
      isFromAbsentQueue: true,
    };
  }

  /**
   * Valida que el ejecutivo tenga permisos sobre el módulo del ticket
   */
  async validateModulePermissions(ticketData: any, moduleId: string) {
    const moduleIdToCheck = ticketData.isFromAbsentQueue
      ? ticketData.absentTicket.serviceModuleId
      : ticketData.ticket.serviceModuleId;

    if (moduleIdToCheck !== moduleId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permisos para gestionar este ticket',
      });
    }
  }

  /**
   * Valida el estado del ticket según su origen (cola principal o ausentes)
   */
  async validateTicketStateForAbsence(ticketData: any) {
    if (!ticketData.isFromAbsentQueue) {
      // Ticket en cola principal: debe estar CALLED o ATTENDING
      // Esta validación ya existe en tu ticketService.validateTicket
      // Se mantiene la llamada original por compatibilidad
      return; // La validación se hace en la función principal
    } else {
      // Ticket en cola de ausentes: debe estar WAITING
      if (ticketData.absentTicket.status !== TicketStatus.WAITING) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message:
            'El ticket ausente debe estar en estado WAITING para ser marcado como ausente nuevamente',
        });
      }
    }
  }

  /**
   * Procesa la primera ausencia: mueve ticket de cola principal a cola de ausentes
   */
  async processFirstAbsence(
    ticketId: string,
    ticket: any,
    executiveId: string,
  ) {
    const result = await this.$transaction(async (tx) => {
      // Crear ticket en cola de ausentes
      const newAbsentTicket = await tx.queueTicketAbsent.create({
        data: {
          queueId: ticket.queueId,
          userId: ticket.userId,
          serviceModuleId: ticket.serviceModuleId,
          executiveId: executiveId,
          ticketNumber: ticket.ticketNumber,
          anonymousEmail: ticket.anonymousEmail,
          anonymousPhone: ticket.anonymousPhone,
          registrationToken: ticket.registrationToken,
          estimatedWaitTime: ticket.estimatedWaitTime,
          priorityLevel: ticket.priorityLevel,
          entryType: ticket.entryType,
          absenceTime: new Date(),
          originalEntryTime: ticket.entryTime,
        },
      });

      // OBLIGATORIAMENTE eliminar de cola principal
      await tx.queueTicket.delete({
        where: { id: ticketId },
      });

      return {
        originalTicket: ticket,
        absentTicket: newAbsentTicket,
        newTicketCode: `R${ticket.ticketNumber.toString().padStart(3, '0')}`,
      };
    });

    return {
      status: HttpStatus.OK,
      message: 'Ticket marcado como ausente y movido a cola de reintento',
      data: result,
    };
  }

  /**
   * Procesa la segunda ausencia: mueve ticket de cola de ausentes a histórico
   */
  async processSecondAbsence(ticketId: string, absentTicket: any) {
    const result = await this.$transaction(async (tx) => {
      // Crear registro histórico
      const historyRecord = await tx.ticketHistory.create({
        data: {
          originalId: absentTicket.id,
          userId: absentTicket.userId,
          serviceModuleId: absentTicket.serviceModuleId,
          queueId: absentTicket.queueId,
          ticketNumber: absentTicket.ticketNumber,
          status: TicketStatus.ABSENT,
          entryType: absentTicket.entryType,
          entryTime: absentTicket.originalEntryTime,
          callTime: null,
          serviceTime: null,
          endTime: new Date(),
          priorityLevel: absentTicket.priorityLevel,
          waitTime: null,
        },
      });

      // Eliminar de cola de ausentes
      await tx.queueTicketAbsent.delete({
        where: { id: ticketId },
      });

      return {
        historyRecord,
        originalAbsentTicket: absentTicket,
      };
    });

    return {
      status: HttpStatus.OK,
      message: 'Ticket eliminado definitivamente tras segunda ausencia',
      data: result,
    };
  }
}
