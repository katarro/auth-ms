import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, RoleType } from '@prisma/client';
import { CreateUserDto } from 'src/common/dto';
import { HashPasswordService } from 'src/common/utils/hash-password.service';

@Injectable()
export class CreateBusinessAdminCommand extends PrismaClient {
  constructor(private readonly hashPassword: HashPasswordService) {
    super();
  }

  // async execute(createUserDto: CreateUserDto) {
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { email, password, role, companyId, rut, ...rest } = createUserDto;

  //   // 1. Verificar que la empresa exista
  //   const existingCompany = await this.company.findUnique({
  //     where: { id: companyId },
  //   });

  //   if (!existingCompany) {
  //     throw new RpcException({
  //       status: HttpStatus.NOT_FOUND,
  //       message: `Company with ID ${companyId} not found`,
  //     });
  //   }

  //   // 2. Buscar el rol ADMIN_BUSINESS
  //   const adminBusinessRole = await this.role.findFirst({
  //     where: { name: RoleType.ADMIN_BUSINESS },
  //   });

  //   if (!adminBusinessRole) {
  //     throw new RpcException({
  //       status: HttpStatus.NOT_FOUND,
  //       message: 'Role ADMIN_BUSINESS not found',
  //     });
  //   }

  //   // 3. Verificar si el usuario ya existe
  //   const existUser = await this.user.findUnique({
  //     where: { email },
  //   });
  //   if (existUser) {
  //     throw new RpcException({
  //       status: HttpStatus.CONFLICT,
  //       message: `User with email ${email} already exists`,
  //     });
  //   }

  //   // 3. Crear el usuario con rol ADMIN_BUSINESS

  //   const user = await this.user.create({
  //     data: {
  //       ...rest,
  //       email,
  //       rut,
  //       phone: createUserDto.phone,
  //       isActive: true,
  //       password: await this.hashPassword.hashearPassword(password),
  //       roleId: adminBusinessRole.id,
  //     },
  //   });

  //   // 4. Actualizar la empresa con el nuevo administrador
  //   await this.company.update({
  //     where: { id: companyId },
  //     data: { adminId: user.id },
  //   });

  //   // 5. Retornar el usuario y la empresa actualizada
  //   return {
  //     user: {
  //       ...user,
  //       password: undefined, // No retornar la contraseña
  //     },
  //     company: {
  //       ...existingCompany,
  //       adminId: user.id,
  //     },
  //   };
  // }
}
