import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, RoleType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { NATS_SERVICES } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGoogle extends PrismaClient {
  constructor(
    @Inject(NATS_SERVICES) private readonly client: ClientProxy,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async authGoogle(payload: any) {
    const { email, password, picture } = payload;

    // Primero obtener el ID del rol CLIENTE
    const clientRole = await this.role.findUnique({
      where: { name: RoleType.CLIENT }, // Asegúrate que este nombre coincida con tu enum en la DB
    });

    if (!clientRole) {
      throw new Error('Rol de cliente no encontrado');
    }

    // Verificar si el usuario ya existe
    let user = await this.user.findFirst({
      where: { email },
      include: { role: true }, // Incluir relación con el rol
    });

    // Si no existe, crear nuevo usuario
    if (!user) {
      user = (await this.user.create({
        data: {
          email,
          password,
          phone: null, // Asegúrate de que esto existe en tu modelo
          picture: picture, // Si existe en tu modelo
          roleId: clientRole.id,
          isActive: true,
        },
        include: { role: true }, // Incluir la relación
      })) as any;
    }
    const jwt = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      role: user.role.name,
    });

    return jwt;
  }
}
