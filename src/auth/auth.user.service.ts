import * as bcrypt from 'bcrypt';
import { envs } from 'src/config/envs';
import { JwtService } from '@nestjs/jwt';
import * as sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';
import { LoginDto } from 'src/common/dto/login.dto';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { UpdateRoleDto, UpdateUserDto } from 'src/common/dto';
import { AuthEventService } from './auth.events.service';
import { Role } from './enums';

@Injectable()
export class AuthUserService extends PrismaClient {
  constructor(
    private readonly eventService: AuthEventService,
    private readonly jwtService: JwtService,
  ) {
    super();
    sgMail.setApiKey(envs.sendgrid_api);
  }

  readonly logger = new Logger('Auth-Services');


  async signJwt(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { name, email, password, role, branch_id } = registerUserDto;
      const user = await this.users.findUnique({ where: { email } });

      if (user) {
        throw new RpcException({
          status: 404,
          message: 'Usuario ya existe',
        });
      }

      if (role === Role.Client && branch_id !== null) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Cliente no puede tener una sucursal asociada',
        });
      }

      const newUser = await this.users.create({
        data: {
          name,
          email,
          password: await this.hashearPassword(password),
          role: role || Role.Client,
          branch_id: branch_id || null,
        },
      });

      const mappedUserDto: RegisterUserDto = {
        ...newUser,
        role: newUser.role as Role, // Casteo explícito
      };
      this.eventService.emitUserCreatedEvent(mappedUserDto);

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        access_token: await this.signJwt(rest),
        status: 200,
        message: 'Usuario registrado',
      };
    } catch (error) {
      throw new RpcException({
        status: 404,
        message: error.message,
      });
    }
  }

  async loginUser(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new RpcException({
        status: 404,
        message: 'Usuario no existe',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new RpcException({
        status: 401,
        message: 'Credenciales incorrectas',
      });
    }

    const { password: __, ...rest } = user;

    return {
      rest,
      access_token: await this.signJwt(rest),
      status: 200,
      message: 'Usuario autenticado',
    };
  }

  async verifyToken(token: string) {
    try {
      const { iat, exp, ...user } = await this.jwtService.verify(token, {
        secret: envs.jwt_constants,
      });

      return {
        user: user,
        access_token: await this.signJwt(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Token inválido',
      });
    }
  }



  async hashearPassword(contrasena: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.users.findUnique({ where: { id } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new RpcException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Contraseña actual no coincide',
        });
      }

      if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Contraseñas no pueden ser iguales',
        });
      }

      const hashedPassword = await this.hashearPassword(
        changePasswordDto.newPassword,
      );

      const updatedUser = await this.users.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });

      this.eventService.emitPasswordChangedEvent(id, hashedPassword);

      const { password: _, ...rest } = updatedUser;

      return {
        user: rest,
        message: 'Contraseña actualizada exitosamente',
        status: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async resetPassword(email: string) {
    try {
      const user = await this.users.findUnique({ where: { email } });

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

      const msg = {
        to: user.email,
        from: envs.sendrig_email,
        subject: 'Restablece tu contraseña',
        html: `
          <p>Hola ${user.email},</p>
          <p>Parece que olvidaste tu contraseña. Haz clic en el enlace para restablecerla:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Este enlace expirará en 15 minutos.</p>
        `,
      };
      await sgMail.send(msg);

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

  async getUsers() {
    try {
      const users = await this.users.findMany();

      if (!users.length) {
        return {
          message: 'No hay usuarios',
          status: HttpStatus.NO_CONTENT,
        };
      }

      return {
        users,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.users.findUnique({ where: { id } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no existe',
        });
      }

      const { password: _, ...rest } = user;

      return {
        user: rest,
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.users.findUnique({ where: { id } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no existe',
        });
      }

      const updatedUser = await this.users.update({
        where: { id },
        data: { ...updateUserDto },
      });

      const { password: _, ...rest } = updatedUser;

      this.eventService.emitUserUpdatedEvent(id, updateUserDto);

      return {
        user: rest,
        message: 'Usuario actualizado exitosamente',
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const user = await this.users.findUnique({ where: { id } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no existe',
        });
      }

      const updatedUser = await this.users.update({
        where: { id },
        data: { ...updateRoleDto },
      });

      const { password: _, ...rest } = updatedUser;

      this.eventService.emitUpdatedRoleEvent(id, updateRoleDto);

      return {
        user: rest,
        message: 'Role actualizado exitosamente',
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}
