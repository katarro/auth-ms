import { NATS_SERVICES } from 'src/config';
import { RegisterUserDto } from 'src/common/dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthEventService {
  constructor(
    @Inject(NATS_SERVICES)
    private readonly client: ClientProxy,
  ) {}

  async emitUserCreatedEvent(registerUserDto: RegisterUserDto) {
    return this.client.emit('user.created', registerUserDto);
  }
}
