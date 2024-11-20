import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RegisterDto } from 'src/common/dto/register-auth.dto';
import { LoginDto } from 'src/common/dto/login-auth.dto';
import { CreateSucursalDto } from 'src/common/dto/create-sucursal.dto';
import { PrismaClient, Rol } from '@prisma/client';
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
  async registerUser(registerDto: RegisterDto) {
    try {
      const { nombre, correo, contrasena, rol } = registerDto;
      const user = await this.usuario.findUnique({ where: { correo } });

      if (user) {
        throw new RpcException({
          status: 404,
          message: 'Usuario ya existe',
        });
      }

      const newUser = await this.usuario.create({
        data: {
          nombre: nombre,
          correo: correo,
          contrasena: await this.hashearContrasena(contrasena),
          rol: rol || 'CLIENTE',
        },
      });

      const { contrasena: __, ...rest } = newUser;

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
    const { correo, contrasena } = loginDto;

    const user = await this.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (!user) {
      throw new RpcException({
        status: 404,
        message: 'Usuario no existe',
      });
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!isPasswordValid) {
      throw new RpcException({
        status: 401,
        message: 'Credenciales incorrectas',
      });
    }

    const { contrasena: __, ...rest } = user;

    return {
      rest,
      access_token: await this.signJwt(rest),
      status: 200,
      message: 'Usuario autenticado',
    };
  }

  async verifyToken(token: string) {
    try {
      // el token se crea con la llave jwt_secret y deben hacer match
      // 1. verificamos el match
      // retornamos el usuario sin el token ni si unformacion (sub,iat, exp)
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

  async registerSucursal(createSucursalDto: CreateSucursalDto, token: string) {
    try {
      // await this.verifyAdminToken(token);

      const { nombre, direccion, horario, estado } = createSucursalDto;

      const sucursal = await this.sucursal.findUnique({ where: { direccion } });

      if (sucursal) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Sucursal ya existe',
        };
      }

      const newSucursal = await this.sucursal.create({
        data: {
          nombre,
          direccion,
          horario,
          estado,
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
      const { rol } = await this.jwtService.verify(token, {
        secret: envs.jwt_constants,
      });

      if (rol !== Rol.ADMIN) {
        throw new RpcException({
          status: 403,
          message: `Acceso denegado, se requiere rol de ${Rol.ADMIN}`,
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

  async hashearContrasena(contrasena: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.usuario.findUnique({ where: { id } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.contrasena,
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

      const updatedUser = await this.usuario.update({
        where: { id },
        data: {
          contrasena: await this.hashearContrasena(
            changePasswordDto.newPassword,
          ),
        },
      });

      const { contrasena: _, ...rest } = updatedUser;

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

  async forgotPassword(correo: string) {
    try {
      const user = await this.usuario.findUnique({ where: { correo } });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuario no existe',
        });
      }

      const token = this.jwtService.sign(
        { correo: user.correo },
        { secret: envs.jwt_constants, expiresIn: '15m' },
      );

      const resetUrl = `${envs.host}:${envs.port_gateway}/auth/usuarios/olvidar-contrasena/${token}`;

      const msg = {
        to: user.correo,
        from: envs.sendrig_email,
        subject: 'Restablece tu contraseña',
        html: `
          <p>Hola ${user.nombre},</p>
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

