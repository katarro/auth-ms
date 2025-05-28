import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, TicketStatus } from '@prisma/client';
import { FormatDateService } from 'src/common/utils/format-date.service';
import { TicketService } from './utils/ticket.service';

@Injectable()
export class ExecutiveService extends PrismaClient {
  constructor(
    private readonly formatDate: FormatDateService,
    private readonly ticketService: TicketService,
  ) {
    super();
  }

  async getCurrentTicket(userId: string) {
    if (!userId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permisos para acceder a este recurso',
      });
    }

    try {
      // Buscar el módulo asignado al ejecutivo
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

      // Buscar el ticket actual en el módulo
      const ticket = await this.queueTicket.findFirst({
        where: {
          serviceModuleId: module.id,
          status: {
            in: [TicketStatus.CALLED, TicketStatus.ATTENDING],
          },
        },
        orderBy: {
          entryTime: 'asc',
        },
      });

      if (!ticket) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No hay ticket actual en este módulo',
        });
      }

      return {
        status: HttpStatus.OK,
        data: ticket,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;

      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener el ticket actual',
        error: error?.message,
      });
    }
  }

  async callNextTicket(userId: string) {
    try {
      if (!userId) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'ID de usuario inválido',
        });
      }

      // 1. Obtener módulo asignado al ejecutivo
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
      if (!module.queueId) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'El módulo no tiene una cola asignada',
        });
      }

      // 2. Verificar que no haya ticket activo aún
      const activeTicket = await this.queueTicket.findFirst({
        where: {
          serviceModuleId: module.id,
          status: { in: [TicketStatus.CALLED, TicketStatus.ATTENDING] },
        },
      });

      if (activeTicket) {
        return activeTicket; // ya hay uno activo
      }

      // 3. Buscar el siguiente ticket en espera
      const nextTicket = await this.queueTicket.findFirst({
        where: {
          queueId: module.queueId,
          status: TicketStatus.WAITING,
        },
        orderBy: {
          entryTime: 'asc',
        },
      });
      console.error('nextTicket', nextTicket);

      if (!nextTicket) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No hay tickets en espera',
        });
      }

      // 5. Actualizar estado del ticket
      const updated = await this.queueTicket.update({
        where: { id: nextTicket.id },
        data: {
          status: TicketStatus.CALLED,
          serviceModuleId: module.id,
          callTime: new Date(),
        },
      });

      // retornar el usuario con su ticket

      const user = await this.user.findFirst({
        where: {
          id: updated.userId,
        },
      });
      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontró el usuario',
        });
      }

      const nameServiceModule = await this.serviceModule.findFirst({
        where: { id: updated.serviceModuleId },
      });
      const nameQueue = await this.queue.findFirst({
        where: { id: updated.queueId },
      });

      const userWithTicket = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
        rut: user.rut,
        queueId: updated.queueId,
        ticket: {
          id: updated.id,
          ticketNumber: updated.ticketNumber,
          queue: nameQueue.name,
          serviceModule: nameServiceModule.name,
          entryType: updated.entryType,
          status: updated.status,
          entryTime: this.formatDate.execute(updated.entryTime),
          callTime: this.formatDate.execute(updated.callTime),
        },
      };

      return userWithTicket;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al llamar al siguiente ticket',
        error: error?.message,
      });
    }
  }

  async completeTicket(ticketId: string, userId: string) {
    try {
      if (!userId || !ticketId) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Faltan datos requeridos',
        });
      }

      const module = await this.ticketService.getAssignedModule(userId);
      await this.ticketService.validateTicket(ticketId, module.id, [
        TicketStatus.CALLED,
        TicketStatus.ATTENDING,
      ]);

      const result = await this.$transaction(async (tx) => {
        const completedTicket = await this.ticketService.markTicketAsCompleted(
          tx,
          ticketId,
          userId,
        );

        const waitTime = this.ticketService.calcTimeInSeconds(
          completedTicket.entryTime,
          completedTicket.endTime,
        );
        const serviceTime = this.ticketService.calcTimeInSeconds(
          completedTicket.callTime,
          completedTicket.endTime,
        );

        await tx.ticketHistory.create({
          data: {
            originalId: completedTicket.id,
            userId: completedTicket.userId,
            serviceModuleId: completedTicket.serviceModuleId,
            queueId: completedTicket.queueId,
            ticketNumber: completedTicket.ticketNumber,
            status: completedTicket.status,
            entryType: completedTicket.entryType,
            entryTime: completedTicket.entryTime,
            callTime: completedTicket.callTime,
            serviceTime,
            endTime: completedTicket.endTime,
            priorityLevel: completedTicket.priorityLevel,
            waitTime,
          },
        });

        await tx.queueTicket.delete({
          where: { id: completedTicket.id },
        });

        return completedTicket;
      });

      return {
        status: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al completar el ticket',
        error: error?.message,
      });
    }
  }

  async markTicketAsAbsent(ticketId: string, userId: string) {
    try {
      if (!userId || !ticketId) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Faltan datos requeridos',
        });
      }

      // 1. Obtener módulo asignado
      const module = await this.ticketService.getAssignedModule(userId);

      // 2. Buscar ticket y determinar origen
      const ticketData =
        await this.ticketService.findTicketForAbsence(ticketId);

      // 3. Validar permisos del módulo
      await this.ticketService.validateModulePermissions(ticketData, module.id);

      // 4. Validar estado del ticket según origen
      await this.ticketService.validateTicketStateForAbsence(ticketData);

      // 5. Procesar ausencia según el origen
      if (ticketData.isFromAbsentQueue) {
        return await this.ticketService.processSecondAbsence(
          ticketId,
          ticketData.absentTicket,
        );
      } else {
        return await this.ticketService.processFirstAbsence(
          ticketId,
          ticketData.ticket,
          userId,
        );
      }
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al marcar el ticket como ausente',
        error: error?.message,
      });
    }
  }

  // async ticketCalled(ticketId: string, userId: string) {}
}
