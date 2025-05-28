import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, RoleType } from '@prisma/client';
import {
  CreateBranchDto,
  CreateUserDto,
  UpdateBranchDto,
  UpdateUserDto,
} from 'src/common/dto';
import { FormatDateService } from 'src/common/utils/format-date.service';
import { HashPasswordService } from 'src/common/utils/hash-password.service';

@Injectable()
export class AdminBusinessService extends PrismaClient {
  constructor(
    private readonly formatDate: FormatDateService,
    private readonly hashPassword: HashPasswordService,
  ) {
    super();
  }

  async getAllBranches(idAdminBusiness: string) {
    try {
      const company = await this.company.findFirst({
        where: { adminId: idAdminBusiness },
        include: {
          branches: true, // ← aquí obtienes las sucursales
        },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Company not found for this admin',
        });
      }

      const formattedBranches = company.branches.map((branch) => {
        return {
          ...branch,
          createdAt: this.formatDate.execute(branch.createdAt),
          updatedAt: this.formatDate.execute(branch.updatedAt),
        };
      });

      return formattedBranches;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error fetching branches',
      });
    }
  }

  async getBranchById(idBranch: string, idAdminBusiness: string) {
    try {
      const branch = await this.branch.findUnique({
        where: { id: idBranch },
        include: {
          company: true, // ← incluye la empresa asociada a la sucursal
        },
      });

      if (!branch) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Branch not found',
        });
      }
      if (branch.company.adminId !== idAdminBusiness) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: 'No tienes permiso para acceder a esta sucursal',
        });
      }

      return {
        ...branch,
        createdAt: this.formatDate.execute(branch.createdAt),
        updatedAt: this.formatDate.execute(branch.updatedAt),
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error fetching branch',
      });
    }
  }

  async createBranch(createBranchDto: CreateBranchDto, userId: string) {
    try {
      const { name, address, adminBranchId } = createBranchDto;

      // 1. Obtener empresa asociada al ADMIN_BUSINESS
      const company = await this.company.findFirst({
        where: { adminId: userId },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Empresa no encontrada para este administrador',
        });
      }

      // 2. Verificar que el usuario adminBranchId exista y tenga el rol correcto
      const adminBranch = await this.user.findFirst({
        where: {
          id: adminBranchId,
          companyId: company.id, // debe pertenecer a la misma empresa
        },
        include: {
          role: true,
        },
      });

      if (!adminBranch || adminBranch.role.name !== RoleType.ADMIN_BRANCH) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: 'El usuario no es un administrador de sucursal válido',
        });
      }

      // 🔒 Validar que el adminBranchId no tenga ya una sucursal asignada
      const existingBranch = await this.branch.findFirst({
        where: {
          adminId: adminBranchId,
        },
      });

      if (existingBranch) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Este administrador ya tiene una sucursal asignada',
        });
      }

      // 3. Verificar nombre y dirección duplicados dentro de la empresa
      const nameExists = await this.branch.findFirst({
        where: {
          name,
          companyId: company.id,
        },
      });

      if (nameExists) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Ya existe una sucursal con ese nombre para esta empresa',
        });
      }

      const addressExists = await this.branch.findFirst({
        where: {
          address,
          companyId: company.id,
        },
      });

      if (addressExists) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Ya existe una sucursal con esa dirección para esta empresa',
        });
      }

      // 4. Crear la sucursal
      const branch = await this.branch.create({
        data: {
          name,
          address,
          isActive: true,
          offlineMode: false,
          companyId: company.id,
          adminId: adminBranch.id,
        },
      });

      return {
        message: 'Sucursal creada correctamente',
        branch,
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error al crear sucursal',
      });
    }
  }

  async createBranchAdmin(
    createUserDto: CreateUserDto,
    adminBusinessId: string,
  ) {
    try {
      // 1. Obtener la empresa del admin que está creando
      const company = await this.company.findFirst({
        where: { adminId: adminBusinessId },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontró empresa para este administrador',
        });
      }

      // 2. Validar que el correo no esté en uso
      const existingUser = await this.user.findFirst({
        where: {
          OR: [{ email: createUserDto.email }, { rut: createUserDto.rut }],
        },
      });

      if (existingUser) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: `El correo ${createUserDto.email} o rut ${createUserDto.rut} ya está registrado`,
        });
      }

      // 3. Obtener el rol ADMIN_BRANCH
      const role = await this.role.findFirst({
        where: { name: RoleType.ADMIN_BRANCH },
      });

      if (!role) {
        throw new RpcException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Rol ADMIN_BRANCH no encontrado',
        });
      }

      // 4. Crear el usuario asociado a la empresa
      const user = await this.user.create({
        data: {
          ...createUserDto,
          password: await this.hashPassword.hashearPassword(
            createUserDto.password,
          ),
          role: {
            connect: { id: role.id },
          },
          company: {
            connect: { id: company.id },
          },
        },
      });

      return {
        message: 'Administrador de sucursal creado exitosamente',
        user: {
          ...user,
          password: undefined, // no retornar contraseña
        },
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error al crear administrador de sucursal',
      });
    }
  }

  async updateBranch(idBranch: string, updateBranchDto: UpdateBranchDto) {
    try {
      const branch = await this.branch.findUnique({
        where: { id: idBranch },
      });

      if (!branch) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Sucursal no encontrada',
        });
      }

      const updatedBranch = await this.branch.update({
        where: { id: idBranch },
        data: {
          ...updateBranchDto,
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Sucursal actualizada correctamente',
        branch: updatedBranch,
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error al actualizar sucursal',
      });
    }
  }

  async deleteBranch(idBranch: string) {
    try {
      const branch = await this.branch.findUnique({
        where: { id: idBranch },
      });

      if (!branch) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Sucursal no encontrada',
        });
      }

      const branchDeleted = await this.branch.update({
        where: { id: idBranch },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Sucursal eliminada correctamente',
        branch: branchDeleted,
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error al eliminar sucursal',
      });
    }
  }

  async getAllBranchAdmins(adminBusinessId: string) {
    try {
      // 1. Obtener la empresa que administra este usuario
      const company = await this.company.findFirst({
        where: { adminId: adminBusinessId },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Empresa no encontrada para este administrador',
        });
      }

      // 2. Obtener el rol ADMIN_BRANCH
      const role = await this.role.findFirst({
        where: { name: RoleType.ADMIN_BRANCH },
      });

      if (!role) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Rol ADMIN_BRANCH no encontrado',
        });
      }

      // 3. Buscar usuarios con ese rol, vinculados a esta empresa, que administren alguna sucursal
      const admins = await this.user.findMany({
        where: {
          roleId: role.id,
          companyId: company.id,
          managedBranches: {
            some: {}, // esto asegura que tenga al menos una sucursal asociada
          },
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          managedBranches: {
            select: {
              id: true,
              name: true,
              address: true,
              isActive: true,
            },
          },
        },
      });

      return admins;
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error?.message ?? 'Error al obtener administradores de sucursal',
      });
    }
  }

  async getBusinessMetrics(idAdminBusiness: string) {
    try {
      const company = await this.company.findFirst({
        where: { adminId: idAdminBusiness },
        include: {
          branches: {
            include: {
              admin: true, // ADMIN_BRANCH
              serviceModules: {
                include: {
                  currentExecutive: true,
                },
              },
            },
          },
        },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Empresa no encontrada',
        });
      }

      return {
        id: company.id,
        name: company.name,
        rut: company.rut,
        email: company.email,
        phone: company.phone,
        address: company.address,
        isActive: company.isActive,
        branches: company.branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          isActive: branch.isActive,
          offlineMode: branch.offlineMode,
          admin: branch.admin
            ? {
                id: branch.admin.id,
                name: branch.admin.name,
                email: branch.admin.email,
                phone: branch.admin.phone,
              }
            : null,
          serviceModules: branch.serviceModules.map((mod) => ({
            id: mod.id,
            name: mod.name,
            executive: mod.currentExecutive
              ? {
                  id: mod.currentExecutive.id,
                  name: mod.currentExecutive.name,
                  email: mod.currentExecutive.email,
                }
              : null,
          })),
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? 'Error al obtener el detalle completo',
      });
    }
  }

  async updateBranchAdmin(
    idAdminBusiness: string,
    idAdminBranch: string,
    updateDto: UpdateUserDto,
  ) {
    try {
      // 1. Verificar que el admin_business tenga una empresa
      const company = await this.company.findFirst({
        where: { adminId: idAdminBusiness },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Empresa no encontrada para este administrador',
        });
      }

      // 2. Verificar que el admin_branch exista y pertenezca a la empresa
      const adminBranch = await this.user.findFirst({
        where: {
          id: idAdminBranch,
          companyId: company.id,
          role: { name: RoleType.ADMIN_BRANCH },
        },
      });

      if (!adminBranch) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: 'El usuario no pertenece a tu empresa o no es ADMIN_BRANCH',
        });
      }

      // 3. Actualizar datos permitidos
      const updated = await this.user.update({
        where: { id: idAdminBranch },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Administrador de sucursal actualizado correctamente',
        user: {
          ...updated,
          password: undefined, // nunca retornar contraseña
        },
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error?.message ?? 'Error al actualizar administrador de sucursal',
      });
    }
  }
}
