import { Injectable, Logger } from '@nestjs/common';
import { RegisterDto } from 'src/common/dto/register-auth.dto';
import { LoginDto } from 'src/common/dto/login-auth.dto';
import { CreateSucursalDto } from 'src/common/dto/create-sucursal.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  readonly logger = new Logger('Auth-Services');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Conectado a PostgreSQL');
  }

  async signJwt(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async hashearContrasena(contrasena: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasena, salt);
  }

  async registerUser(registerDto: RegisterDto) {
    try {
      const { nombre, correo, contrasena } = registerDto;
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
          rol: 'CLIENTE',
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

  registerSucursal(createSucursalDto: CreateSucursalDto) {
    return 'Registrar una sucursal';
  }
}
