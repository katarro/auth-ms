import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { envs } from 'src/config/envs';
import { CreateBranchDto } from 'src/common/dto/create-branch.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateBranchDto } from 'src/common/dto';
import { AuthEventService } from './auth.events.service';

@Injectable()
export class AuthBranchService extends PrismaClient {
  constructor(
    private readonly authEventsService: AuthEventService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }
  readonly logger = new Logger('Auth-Services');

  async registerBranch(createBranchDto: CreateBranchDto, token: string) {
    try {
      await this.verifyAdminToken(token);

      const { name, address, schedule, status, available } = createBranchDto;

      const sucursal = await this.branch.findUnique({ where: { address } });

      if (sucursal) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Sucursal ya existe',
        };
      }

      const newSucursal = await this.branch.create({
        data: {
          name,
          address,
          schedule,
          status,
          available,
        },
      });

      this.authEventsService.emitBranchCreatedEvent(newSucursal);

      return {
        sucursal: newSucursal,
        status: HttpStatus.CREATED,
        message: 'Sucursal registrada',
      };
    } catch (error) {
      console.log('error malo');
      throw new RpcException({
        status: error.status || HttpStatus.NOT_FOUND,
        message: error.message,
      });
    }
  }

  async verifyAdminToken(token: string) {
    try {
      const { role } = await this.jwtService.verify(token, {
        secret: envs.jwt_constants,
      });

      if (role !== Role.Admin) {
        throw new RpcException({
          status: 403,
          message: `Acceso denegado, se requiere rol de ${Role.Admin}`,
        });
      }
      return true;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido',
      });
    }
  }

  async getBranches() {
    try {
      const branches = await this.branch.findMany({
        where: {
          available: true,
        },
      });

      if (branches.length === 0) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No hay sucursales disponibles',
        });
      }

      return {
        branches,
        status: HttpStatus.OK,
        message: 'Sucursales encontradas',
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error al obtener sucursales',
      });
    }
  }

  async deleteBranch(id: number) {
    try {
      const branch = await this.branch.findUnique({ where: { id } });

      if (!branch) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Sucursal no encontrada',
        });
      }

      const deleteBranch = await this.branch.update({
        where: { id },
        data: { available: false },
      });

      return {
        branch: deleteBranch,
        status: HttpStatus.ACCEPTED,
        message: 'Sucursal eliminada',
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error al eliminar sucursal',
      });
    }
  }

  async updateBranch(id: number, updateBranchDto: UpdateBranchDto) {
    try {
      const branch = await this.branch.findUnique({ where: { id } });

      if (!branch) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Sucursal no encontrada',
        });
      }

      const updatedBranch = await this.branch.update({
        where: { id },
        data: { ...updateBranchDto },
      });

      return {
        branch: updatedBranch,
        status: HttpStatus.ACCEPTED,
        message: 'Sucursal actualizada',
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error al actualizar sucursal',
      });
    }
  }

  async getBranchById(id: number) {
    try {
      const branch = await this.branch.findUnique({ where: { id } });

      if (!branch) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Sucursal no existe',
        });
      }

      return {
        branch,
        status: HttpStatus.OK,
        message: 'Sucursal encontrada',
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error al obtener sucursal',
      });
    }
  }
}
