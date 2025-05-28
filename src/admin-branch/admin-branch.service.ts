import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, RoleType } from '@prisma/client';
import { CreateModuleWithQueueDto, CreateUserDto } from 'src/common/dto';
import { HashPasswordService } from 'src/common/utils/hash-password.service';

@Injectable()
export class AdminBranchService extends PrismaClient {
  constructor(private readonly hashPassword: HashPasswordService) {
    super();
  }

  async getAllQueues(userId: string) {
    try {
      // 1. Buscar las sucursales administradas por este usuario
      const branches = await this.branch.findMany({
        where: { adminId: userId },
        select: { id: true },
      });

      if (!branches.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron sucursales para este usuario',
        });
      }

      const branchIds = branches.map((branch) => branch.id);

      // 2. Buscar los módulos de atención en esas sucursales
      const modules = await this.serviceModule.findMany({
        where: { branchId: { in: branchIds } },
        select: { id: true },
      });

      if (!modules.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron módulos de atención en tus sucursales',
        });
      }

      const moduleIds = modules.map((m) => m.id);

      // 3. Obtener las colas asociadas a esos módulos
      const queues = await this.queue.findMany({
        where: {
          serviceModuleId: { in: moduleIds },
        },
        include: {
          serviceModule: {
            include: {
              branch: true,
            },
          },
          serviceType: true,
        },
      });

      if (!queues.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron colas para este usuario',
        });
      }

      return {
        message: 'Colas obtenidas exitosamente',
        status: HttpStatus.OK,
        queues,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;

      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener las colas',
        error: error?.message,
      });
    }
  }

  async createExecutive(createUserDto: CreateUserDto, userId: string) {
    // 1. Validar que el ADMIN_BRANCH administra una sucursal activa
    const { password, ...rest } = createUserDto;
    if (!userId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permisos para crear ejecutivos en esta sucursal',
      });
    }
    if (!createUserDto) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'No se ha enviado el DTO de creación de usuario',
      });
    }
    const branch = await this.branch.findFirst({
      where: {
        adminId: userId,
        isActive: true,
      },
      include: {
        company: true,
      },
    });

    if (!branch) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permisos para crear ejecutivos en esta sucursal',
      });
    }

    // 2. Obtener el rol EXECUTIVE
    const roleRecord = await this.role.findFirst({
      where: { name: RoleType.EXECUTIVE },
    });

    if (!roleRecord) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Rol EXECUTIVE no encontrado',
      });
    }

    // 3. Crear el ejecutivo asociado a la sucursal y empresa del admin
    try {
      const createdExecutive = await this.user.create({
        data: {
          ...rest,
          password: await this.hashPassword.hashearPassword(password),
          branch: {
            connect: {
              id: branch.id,
            },
          },
          company: {
            connect: {
              id: branch.company.id,
            },
          },
          role: {
            connect: {
              id: roleRecord.id,
            },
          },
          isActive: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...executiveWithoutPassword } = createdExecutive;
      return {
        status: HttpStatus.CREATED,
        message: 'Ejecutivo creado exitosamente',
        data: executiveWithoutPassword,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el ejecutivo',
        error: error?.message,
      });
    }
  }

  async createModuleWithQueue(dto: CreateModuleWithQueueDto, userId: string) {
    const { module, queue } = dto;

    // Validaciones de entrada
    if (!userId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permisos para crear módulos en esta sucursal',
      });
    }

    if (!module || !queue) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'No se ha enviado el DTO de creación de módulo o cola',
      });
    }

    if (!module.branchId || !module.serviceTypeId) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'El módulo debe tener branchId y serviceTypeId',
      });
    }

    // Validar que el módulo no exista ya
    const existingModule = await this.serviceModule.findFirst({
      where: {
        name: module.name,
        branchId: module.branchId,
      },
    });

    if (existingModule) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Ya existe un módulo con ese nombre en esta sucursal',
      });
    }

    // Verificar existencia de la sucursal
    const branch = await this.branch.findFirst({
      where: { id: module.branchId },
    });

    if (!branch) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'No existe la sucursal',
      });
    }

    // Verificar permisos del ADMIN_BRANCH sobre la sucursal
    if (branch.adminId !== userId || !branch.isActive) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No tienes permisos para crear módulos en esta sucursal',
      });
    }

    // Transacción: crear módulo y cola
    try {
      const result = await this.$transaction(async (tx) => {
        // Validar que no exista una cola con el mismo nombre en la sucursal
        const duplicateQueue = await tx.queue.findFirst({
          where: {
            name: queue.name,
            branchId: module.branchId,
          },
        });

        if (duplicateQueue) {
          throw new RpcException({
            status: HttpStatus.BAD_REQUEST,
            message: 'Ya existe una cola con ese nombre en esta sucursal',
          });
        }

        // Crear módulo (sin queueId aún)
        const createdModule = await tx.serviceModule.create({
          data: {
            name: module.name,
            branchId: module.branchId,
            serviceTypeId: module.serviceTypeId,
            currentExecutiveId: module.currentExecutiveId,
            isActive: module.isActive ?? true,
          },
        });

        // Crear queue asociada
        const createdQueue = await tx.queue.create({
          data: {
            name: queue.name,
            branchId: module.branchId, // necesario para validación y relación
            serviceModuleId: createdModule.id,
            serviceTypeId: queue.serviceTypeId,
            isActive: queue.isActive ?? true,
          },
        });

        // Actualizar módulo con queueId
        const updatedModule = await tx.serviceModule.update({
          where: { id: createdModule.id },
          data: { queueId: createdQueue.id },
          include: { queue: true },
        });

        return updatedModule;
      });

      return {
        status: HttpStatus.CREATED,
        data: result,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el módulo de atención y su fila asociada',
        error: error?.message,
      });
    }
  }

  async getAllServicesModules(userId: string) {
    try {
      // 1. Buscar las sucursales administradas por este usuario
      const branches = await this.branch.findMany({
        where: { adminId: userId },
        select: { id: true },
      });

      if (!branches.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron sucursales para este usuario',
        });
      }

      const branchIds = branches.map((branch) => branch.id);

      // 2. Buscar los módulos de atención en esas sucursales
      const modules = await this.serviceModule.findMany({
        where: { branchId: { in: branchIds } },
        include: {
          queue: true,
          serviceType: true,
          branch: true,
        },
      });

      if (!modules.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron módulos de atención en tus sucursales',
        });
      }

      return {
        message: 'Módulos obtenidos exitosamente',
        status: HttpStatus.OK,
        modules,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;

      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener los módulos de atención',
        error: error?.message,
      });
    }
  }

  async getAllExecutives(userId: string) {
    try {
      if (!userId) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message:
            'No tienes permisos para ver los ejecutivos de esta sucursal',
        });
      }
      // 1. Buscar las sucursales administradas por este usuario
      const branches = await this.branch.findMany({
        where: { adminId: userId },
        select: { id: true },
      });

      if (!branches.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron sucursales para este usuario',
        });
      }

      const branchIds = branches.map((branch) => branch.id);

      const roleRecord = await this.role.findFirst({
        where: { name: RoleType.EXECUTIVE },
      });

      // 2. Buscar los ejecutivos en esas sucursales
      const executives = await this.user.findMany({
        where: {
          branchId: { in: branchIds },
          roleId: roleRecord.id,
        },
        include: {
          branch: true,
          company: true,
        },
      });

      if (!executives.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron ejecutivos en tus sucursales',
        });
      }

      return {
        message: 'Ejecutivos obtenidos exitosamente',
        status: HttpStatus.OK,
        executives,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;

      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener los ejecutivos',
        error: error?.message,
      });
    }
  }

  async getBranchMetrics(userId: string) {
    if (!userId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: 'No autorizado',
      });
    }

    try {
      // 1. Obtener sucursales administradas por el usuario
      const branches = await this.branch.findMany({
        where: { adminId: userId },
        select: { id: true, name: true },
      });

      if (!branches.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron sucursales para este administrador',
        });
      }

      const branchIds = branches.map((b) => b.id);

      // 2. Obtener colas de esas sucursales
      const queues = await this.queue.findMany({
        where: { branchId: { in: branchIds } },
        select: {
          id: true,
          name: true,
          branchId: true,
          metrics: true, // relación Queue -> QueueMetrics
        },
      });

      return {
        status: HttpStatus.OK,
        data: queues.map((queue) => ({
          queueId: queue.id,
          queueName: queue.name,
          branchId: queue.branchId,
          metrics: queue.metrics, // cada métrica por hora
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener métricas',
        error: error?.message,
      });
    }
  }
}
