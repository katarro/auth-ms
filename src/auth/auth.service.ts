import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { CreateBranchDto } from 'src/common/dto/create-branch.dto';
import { PrismaClient, Role } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { envs } from 'src/config/envs';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class AuthService extends PrismaClient {
  constructor(private readonly jwtService: JwtService) {
    super();
    sgMail.setApiKey(envs.sendgrid_api);
  }

  readonly logger = new Logger('Auth-Services');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Conectado a PostgreSQL');
  }

  //Cambiar a registerUserDto
  async registerUser(registerDto: RegisterUserDto) {
    try {
      const { name, email, password, role } = registerDto;
      const user = await this.user.findUnique({ where: { email } });

      if (user) {
        throw new RpcException({
          status: 404,
          message: 'Usuario ya existe',
        });
      }

      const newUser = await this.user.create({
        data: {
          name: name,
          email: email,
          password: await this.hashearPassword(password),
          role: role || Role.Client,
        },
      });

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

    const user = await this.user.findUnique({
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

  async registerSucursal(createBranchDto: CreateBranchDto, token: string) {
    try {
      await this.verifyAdminToken(token);

      const { name, address, schedule, status } = createBranchDto;

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
        },
      });

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
        status: 401, //HttpStatus.UNAUTHORIZED,
        message: 'Token inválido',
      });
    }
  }

  async signJwt(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async hashearPassword(contrasena: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.user.findUnique({ where: { id } });

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

      const updatedUser = await this.user.update({
        where: { id },
        data: {
          password: await this.hashearPassword(
            changePasswordDto.newPassword,
          ),
        },
      });

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
}
