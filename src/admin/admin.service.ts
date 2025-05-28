import { RpcException } from '@nestjs/microservices';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient, RoleType } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from 'src/common/dto';
import * as bcryptjs from 'bcryptjs';
import { FormatDateService } from 'src/common/utils/format-date.service';
import { HashPasswordService } from 'src/common/utils/hash-password.service';

@Injectable()
export class AdminService extends PrismaClient {
  constructor(
    private readonly hashPassword: HashPasswordService,
    private readonly formatDate: FormatDateService,
  ) {
    super();
  }

  async hashearPassword(contrasena: string) {
    const salt = bcryptjs.genSaltSync(10);
    return bcryptjs.hashSync(contrasena, salt);
  }

  async getAllUsers() {
    try {
      const allUsers = await this.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          picture: true,
          roleId: true,
          customerTypeId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          customerType: true,
        },
      });
      const usersWithRoleAndCustomerType = allUsers.map((user) => ({
        ...user,
        role: user.role.name,
        customerType: user.customerType?.name,
      }));

      if (!allUsers || allUsers.length === 0) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No users found',
        });
      }

      return usersWithRoleAndCustomerType;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          picture: true,
          roleId: true,
          customerTypeId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          customerType: true,
        },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      return {
        ...user,
        role: user.role.name,
        customerType: user.customerType?.name,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async createAdminBusiness(createUserDto: CreateUserDto) {
    try {
      const { email, password, rut, ...rest } = createUserDto;

      // 1. Buscar el rol ADMIN_BUSINESS
      const adminBusinessRole = await this.role.findFirst({
        where: { name: RoleType.ADMIN_BUSINESS },
      });

      if (!adminBusinessRole) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Role ADMIN_BUSINESS not found',
        });
      }

      // 3. Verificar si el usuario ya existe
      const existUser = await this.user.findFirst({
        where: {
          OR: [{ email }, { rut }],
        },
      });

      if (existUser) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: `User with email ${email} or rut ${rut} already exists`,
        });
      }

      // 3. Crear el usuario con rol ADMIN_BUSINESS

      const user = await this.user.create({
        data: {
          ...rest,
          email,
          rut,
          phone: createUserDto.phone,
          isActive: true,
          password: await this.hashPassword.hashearPassword(password),
          role: {
            connect: {
              id: adminBusinessRole.id,
            },
          },
        },
      });

      // 5. Retornar el usuario y la empresa actualizada
      return {
        user: {
          ...user,
          password: undefined, // No retornar la contraseña
        },
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async createAdminBranch(createUserDto: CreateUserDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, password, rut, ...rest } = createUserDto;

      // 2. Buscar el rol ADMIN_BRANCH
      const adminBranchRole = await this.role.findFirst({
        where: { name: RoleType.ADMIN_BRANCH },
      });

      if (!adminBranchRole) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Role ADMIN_BRANCH not found',
        });
      }

      // 3. Verificar si el usuario ya existe
      const existUser = await this.user.findFirst({
        where: {
          OR: [{ email }, { rut }],
        },
      });
      if (existUser) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: `User with email ${email} or rut ${rut} already exists`,
        });
      }

      // 3. Crear el usuario con rol ADMIN_BRANCH

      const user = await this.user.create({
        data: {
          ...rest,
          email,
          rut,
          phone: createUserDto.phone,
          isActive: true,
          password: await this.hashPassword.hashearPassword(password),
          role: {
            connect: {
              id: adminBranchRole.id,
            },
          },
        },
      });

      // 5. Retornar el usuario y la sucursal actualizada
      return {
        user: {
          ...user,
          password: undefined, // No retornar la contraseña
        },
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async createExecutive(createUserDto: CreateUserDto, moduleId: string) {
    try {
      // Verificar que el módulo existe
      const serviceModule = await this.serviceModule.findUnique({
        where: { id: moduleId },
        include: {
          branch: true,
          serviceType: true,
          queue: true,
        },
      });

      if (!serviceModule) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Module with ID ${moduleId} not found`,
        });
      }

      // Buscar el rol EXECUTIVE
      const executiveRole = await this.role.findFirst({
        where: { name: RoleType.EXECUTIVE },
      });

      if (!executiveRole) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Role EXECUTIVE not found',
        });
      }

      // Verificar si el email ya existe
      const existingUser = await this.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Email already in use',
        });
      }

      // Crear transacción para asegurar que se completa correctamente
      // 1. Crear el usuario ejecutivo
      const hashedPassword = await this.hashPassword.hashearPassword(
        createUserDto.password,
      );

      const newExecutive = await this.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
          phone: createUserDto.phone,
          picture: createUserDto.picture,
          roleId: executiveRole.id,
        },
      });

      // 2. Si hay un ejecutivo actual, finalizar su asignación
      if (serviceModule.currentExecutiveId) {
        const currentAssignment = await this.moduleAssignment.findFirst({
          where: {
            moduleId: serviceModule.id,
            executiveId: serviceModule.currentExecutiveId,
            endTime: null,
          },
        });

        if (currentAssignment) {
          await this.moduleAssignment.update({
            where: { id: currentAssignment.id },
            data: { endTime: new Date() },
          });
        }
      }

      // 3. Actualizar el módulo con el nuevo ejecutivo
      await this.serviceModule.update({
        where: { id: serviceModule.id },
        data: { currentExecutiveId: newExecutive.id },
      });

      // 4. Crear registro de asignación
      const assignment = await this.moduleAssignment.create({
        data: {
          moduleId: serviceModule.id,
          executiveId: newExecutive.id,
          startTime: new Date(),
        },
      });

      // 5. Retornar la información completa
      return {
        executive: {
          id: newExecutive.id,
          name: newExecutive.name,
          email: newExecutive.email,
          phone: newExecutive.phone,
          picture: newExecutive.picture,
        },
        serviceModule: {
          id: serviceModule.id,
          name: serviceModule.name,
          serviceType: serviceModule.serviceType.name,
        },
        branch: {
          id: serviceModule.branch.id,
          name: serviceModule.branch.name,
        },
        queue: {
          id: serviceModule.queue.id,
          name: serviceModule.queue.name,
        },
        assignment: {
          id: assignment.id,
          startTime: assignment.startTime,
        },
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (!id) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User ID is required',
        });
      }
      if (Object.keys(updateUserDto).length === 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'No data provided for update',
        });
      }
      const user = await this.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      const updatedUser = await this.user.update({
        where: { id },
        data: {
          ...updateUserDto,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async deleteUser(id: string) {
    try {
      if (!id) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User ID is required',
        });
      }

      const user = await this.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      const deletedUser = await this.user.update({
        where: { id },
        data: { isActive: false },
        include: {
          role: true,
          customerType: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: ___, ...rest } = deletedUser;

      return { message: 'User deleted successfully', user: rest };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getAllCompanies() {
    try {
      const companies = await this.company.findMany();

      if (!companies || companies.length === 0) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No companies found',
        });
      }

      const companiesWithAdmin = await Promise.all(
        companies.map(async (company) => {
          const admin = await this.user.findUnique({
            where: { id: company.adminId },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              picture: true,
              roleId: true,
              customerTypeId: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              role: true,
              customerType: true,
            },
          });

          return {
            ...company,
            admin: admin
              ? {
                  ...admin,
                  role: admin.role.name,
                  customerType: admin.customerType?.name,
                }
              : null,
          };
        }),
      );

      return companiesWithAdmin;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getCompanyById(id: string) {
    try {
      if (!id) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User ID is required',
        });
      }

      const company = await this.company.findUnique({
        where: { id: id },
        include: {
          admin: true,
          branches: true,
          _count: true,
        },
      });

      return company;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      const {
        address,
        description,
        email,
        name,
        phone,
        rut,
        admin_email,
        logo,
        website,
      } = createCompanyDto;

      // Verificar si ya existe una empresa con el mismo rut
      const existingCompany = await this.company.findUnique({
        where: { rut },
      });

      if (existingCompany) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Company already exists',
        });
      }

      // Buscar al usuario admin
      const admin = await this.user.findUnique({
        where: { email: admin_email },
      });

      if (!admin) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Admin user not found',
        });
      }

      // Verificar rol del usuario
      const role = await this.role.findFirst({
        where: { name: RoleType.ADMIN_BUSINESS },
      });

      if (admin.roleId !== role.id) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: 'User is not an admin',
        });
      }

      // 🚫 Verificar si ya es admin de otra empresa
      const isAdminAlreadyAssigned = await this.company.findFirst({
        where: { adminId: admin.id },
      });

      if (isAdminAlreadyAssigned) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'User is already assigned to a company',
        });
      }

      // Crear la empresa
      const newCompany = await this.company.create({
        data: {
          address,
          description,
          email,
          isActive: true,
          name,
          phone,
          rut,
          adminId: admin.id,
          logo,
          website,
        },
      });

      return {
        company: newCompany,
        admin: {
          ...admin,
          password: undefined, // No retornar la contraseña
        },
        message: 'Company created successfully',
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message ?? JSON.stringify(error),
      });
    }
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      if (!id) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Company ID is required',
        });
      }

      const company = await this.company.findUnique({
        where: { id },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Company not found',
        });
      }

      const updatedCompany = await this.company.update({
        where: { id },
        data: {
          ...updateCompanyDto,
          updatedAt: new Date(),
        },
      });

      return {
        company: updatedCompany,
        message: 'Company updated successfully',
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async deleteCompany(id: string) {
    try {
      if (!id) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Company ID is required',
        });
      }

      const company = await this.company.findUnique({
        where: { id },
      });

      if (!company) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Company not found',
        });
      }

      const deletedCompany = await this.company.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        message: 'Company deleted successfully',
        company: deletedCompany,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getAllRoles() {
    try {
      const roles = await this.role.findMany();

      if (!roles || roles.length === 0) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No roles found',
        });
      }

      const formattedRoles = roles.map((role) => ({
        ...role,
        createdAt: this.formatDate.execute(role.createdAt),
        updatedAt: this.formatDate.execute(role.updatedAt),
      }));

      return formattedRoles;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getDashboardMetrics() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const [
        // Usuarios y roles
        totalUsers,
        executivesOnline,

        // Empresas y sucursales
        totalCompanies,
        totalBranches,
        offlineBranches,

        // Módulos de servicio
        totalModules,
        activeModules,
        inactiveModules,

        // Colas y tickets
        totalQueues,
        totalTicketsToday,
        ticketsGroupedByStatus,

        // Métricas de rendimiento
        avgWaitTimeToday,
        avgQueueLength,

        // Satisfacción del cliente
        totalSurveys,
        avgRating,
        ratingsBreakdown,

        // Seguridad y sistema
        syncFailures,
        fraudAttemptsToday,
        notificationsSentToday,
        systemLogsToday,
      ] = await Promise.all([
        this.user.count(),
        this.serviceModule.count({
          where: { currentExecutiveId: { not: null } },
        }),

        this.company.count(),
        this.branch.count(),
        this.branch.count({ where: { offlineMode: true } }),

        this.serviceModule.count(),
        this.serviceModule.count({ where: { isActive: true } }),
        this.serviceModule.count({ where: { isActive: false } }),

        this.queue.count(),
        this.queueTicket.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        this.queueTicket.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),

        this.queueMetrics.aggregate({
          _avg: { averageWaitTime: true },
          where: { date: { gte: startOfDay, lte: endOfDay } },
        }),
        this.queueMetrics.aggregate({
          _avg: { averageQueueLength: true },
          where: { date: { gte: startOfDay, lte: endOfDay } },
        }),

        this.satisfactionSurvey.count(),
        this.satisfactionSurvey.aggregate({ _avg: { rating: true } }),
        this.satisfactionSurvey.groupBy({
          by: ['rating'],
          _count: { _all: true },
        }),

        this.offlineSyncQueue.count({ where: { syncStatus: 'FAILED' } }),
        this.fraudDetection.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        this.notification.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        this.systemLog.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
      ]);

      return {
        users: {
          total: totalUsers,
          executivesOnline,
        },
        operations: {
          companies: totalCompanies,
          branches: totalBranches,
          offlineBranches,
          queues: totalQueues,
          modules: {
            total: totalModules,
            active: activeModules,
            inactive: inactiveModules,
          },
          tickets: {
            today: totalTicketsToday,
            byStatus: Object.fromEntries(
              ticketsGroupedByStatus.map(({ status, _count }) => [
                status,
                _count._all,
              ]),
            ),
          },
        },
        performance: {
          averageWaitTime: `${Math.floor(
            (avgWaitTimeToday._avg.averageWaitTime ?? 0) / 60,
          )
            .toString()
            .padStart(2, '0')}:${Math.floor(
            (avgWaitTimeToday._avg.averageWaitTime ?? 0) % 60,
          )
            .toString()
            .padStart(2, '0')}`,
          averageQueueLength: avgQueueLength._avg.averageQueueLength ?? 0,
          satisfaction: {
            totalSurveys,
            averageRating: avgRating._avg.rating ?? 0,
            ratingsBreakdown: Object.fromEntries(
              ratingsBreakdown.map((r) => [r.rating, r._count._all]),
            ),
          },
        },
        security: {
          syncFailures,
          fraudAttemptsToday,
          notificationsSentToday,
          systemLogsToday,
        },
        lastUpdated: new Date().toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}
