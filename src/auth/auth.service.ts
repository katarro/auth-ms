import * as bcryptjs from 'bcryptjs';
import { envs } from 'src/config/envs';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { IdsCustomerType, sendEmail } from 'src/lib';
import { LoginDto } from 'src/common/dto';

@Injectable()
export class AuthUserService extends PrismaClient {
  constructor(
    private readonly jwtService: JwtService,
    private readonly idCustomerType: IdsCustomerType,
  ) {
    super();
  }

  readonly logger = new Logger('Auth-Services');

  async signJwt(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async hashearPassword(contrasena: string) {
    const salt = bcryptjs.genSaltSync(10);
    return bcryptjs.hashSync(contrasena, salt);
  }

  async registerClient(registerUserDto: RegisterUserDto) {
    try {
      const { email, password } = registerUserDto;

      const user = await this.user.findUnique({ where: { email } });

      if (user) {
        throw new RpcException({
          status: 404,
          message: 'Usuario ya existe',
        });
      }

      // obtener el ID del rol CLIENTE
      const idRoleClient = await this.role.findFirst({
        where: { name: 'CLIENT' },
      });

      if (!idRoleClient) {
        throw new RpcException({
          status: 404,
          message: 'Rol CLIENTE no encontrado',
        });
      }

      // obtener el ID del tipo de cliente
      const idRegularCustomer = await this.idCustomerType.IdRegularCustomer();

      if (!idRegularCustomer) {
        throw new RpcException({
          status: 404,
          message: 'Tipo de cliente REGULAR no encontrado',
        });
      }
      const passwordHash = await this.hashearPassword(password);

      const newUser = await this.user.create({
        data: {
          email: email,
          password: passwordHash,
          roleId: idRoleClient.id,
          customerTypeId: idRegularCustomer,
          isActive: true,
        },
        include: {
          role: true,
          customerType: true,
        },
      });

      const userWithRelations = await this.user.findUnique({
        where: { id: newUser.id },
        include: {
          role: true,
          customerType: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: __, ...rest } = userWithRelations;

      const jwtPayload = {
        id: rest.id,
        name: rest.name,
        email: rest.email,
        role: rest.role.name,
      };

      return {
        user: rest,
        access_token: await this.signJwt(jwtPayload),
        status: HttpStatus.CREATED,
        message: 'Usuario registrado',
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: error.message,
      });
    }
  }

  async loginUser(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.user.findUnique({
        where: { email },
        include: {
          role: true,
          customerType: true,
        },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no existe',
        });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Credenciales incorrectas',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: __, ...rest } = user;
      const jwtPayload = {
        id: rest.id,
        name: rest.name,
        email: rest.email,
        role: rest.role.name,
      };

      return {
        status: HttpStatus.OK,
        message: 'Usuario autenticado',
        access_token: await this.signJwt(jwtPayload),
        user: rest,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const { ...user } = await this.jwtService.verify(token, {
        secret: envs.jwt_constants,
      });

      const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return {
        user,
        token: await this.signJwt(jwtPayload),
        status: HttpStatus.OK,
        message: 'Token verificado',
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: `Token inválido: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  async resetPassword(email: string) {
    try {
      const user = await this.user.findUnique({ where: { email } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no existe',
        });
      }

      const token = this.jwtService.sign(
        { correo: user.email },
        { secret: envs.jwt_constants, expiresIn: '15m' },
      );
      const resetUrl = `${envs.host}:${envs.port_gateway}/auth/usuarios/olvidar-contrasena/${token}`;

      await sendEmail(resetUrl, user.email);

      return {
        message: 'Correo enviado para restablecer la contraseña',
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  // async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
  //   try {
  //     const user = await this.users.findUnique({ where: { id } });

  //     if (!user) {
  //       throw new RpcException({
  //         status: HttpStatus.NOT_FOUND,
  //         message: 'Usuario no encontrado',
  //       });
  //     }

  //     const isPasswordValid = await bcrypt.compare(
  //       changePasswordDto.currentPassword,
  //       user.password,
  //     );

  //     if (!isPasswordValid) {
  //       throw new RpcException({
  //         status: HttpStatus.UNAUTHORIZED,
  //         message: 'Contraseña actual no coincide',
  //       });
  //     }

  //     if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
  //       throw new RpcException({
  //         status: HttpStatus.BAD_REQUEST,
  //         message: 'Contraseñas no pueden ser iguales',
  //       });
  //     }

  //     const hashedPassword = await this.hashearPassword(
  //       changePasswordDto.newPassword,
  //     );

  //     const updatedUser = await this.users.update({
  //       where: { id },
  //       data: {
  //         password: hashedPassword,
  //       },
  //     });

  //     this.eventService.emitPasswordChangedEvent(id, hashedPassword);

  //     const { password: _, ...rest } = updatedUser;

  //     return {
  //       user: rest,
  //       message: 'Contraseña actualizada exitosamente',
  //       status: HttpStatus.ACCEPTED,
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error.message,
  //     });
  //   }
  // }

  // async getUsers() {
  //   try {
  //     const users = await this.users.findMany();

  //     if (!users.length) {
  //       return {
  //         message: 'No hay usuarios',
  //         status: HttpStatus.NO_CONTENT,
  //       };
  //     }

  //     return {
  //       users,
  //       status: HttpStatus.OK,
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       status: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error.message,
  //     });
  //   }
  // }

  // async getUserById(id: number) {
  //   try {
  //     const user = await this.users.findUnique({ where: { id } });

  //     if (!user) {
  //       throw new RpcException({
  //         status: HttpStatus.NOT_FOUND,
  //         message: 'Usuario no existe',
  //       });
  //     }

  //     const { password: _, ...rest } = user;

  //     return {
  //       user: rest,
  //       status: HttpStatus.OK,
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       status: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error.message,
  //     });
  //   }
  // }

  // async updateUser(id: number, updateUserDto: UpdateUserDto) {
  //   try {
  //     const user = await this.users.findUnique({ where: { id } });

  //     if (!user) {
  //       throw new RpcException({
  //         status: HttpStatus.NOT_FOUND,
  //         message: 'Usuario no existe',
  //       });
  //     }

  //     const updatedUser = await this.users.update({
  //       where: { id },
  //       data: { ...updateUserDto },
  //     });

  //     const { password: _, ...rest } = updatedUser;

  //     this.eventService.emitUserUpdatedEvent(id, updateUserDto);

  //     return {
  //       user: rest,
  //       message: 'Usuario actualizado exitosamente',
  //       status: HttpStatus.OK,
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error.message,
  //     });
  //   }
  // }

  // async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
  //   try {
  //     const user = await this.users.findUnique({ where: { id } });

  //     if (!user) {
  //       throw new RpcException({
  //         status: HttpStatus.NOT_FOUND,
  //         message: 'Usuario no existe',
  //       });
  //     }

  //     const updatedUser = await this.users.update({
  //       where: { id },
  //       data: { ...updateRoleDto },
  //     });

  //     const { password: _, ...rest } = updatedUser;

  //     this.eventService.emitUpdatedRoleEvent(id, updateRoleDto);

  //     return {
  //       user: rest,
  //       message: 'Role actualizado exitosamente',
  //       status: HttpStatus.OK,
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error.message,
  //     });
  //   }
  // }
}
