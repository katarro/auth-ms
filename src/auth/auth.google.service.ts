import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
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
    const { email, name, password, picture } = payload;

    let newUser = await this.users.findFirst({
      where: { email },
    });

    if (!newUser) {
      newUser = await this.users.create({
        data: {
          name,
          email,
          password,
          role: Role.Client,
          branch_id: null,
          picture,
        },
      });
    }

    const jwt = await this.jwtService.signAsync({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // emitir evento para que se guarde en el Branch-ms, corregir
    this.client.emit('register.user.branch', newUser);

    return jwt;
  }
}
