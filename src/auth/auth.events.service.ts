import { NATS_SERVICES } from 'src/config';
import {
  CreateBranchDto,
  RegisterUserDto,
  UpdateBranchDto,
  UpdateUserDto,
} from 'src/common/dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthEventService {
  constructor(
    @Inject(NATS_SERVICES)
    private readonly client: ClientProxy,
  ) {}

  // User

  async emitUserCreatedEvent(registerUserDto: RegisterUserDto) {
    return this.client.emit('user.created', registerUserDto);
  }

  async emitBranchCreatedEvent(createBranchDto: CreateBranchDto) {
    return this.client.emit('branch.created', createBranchDto);
  }

  async emitPasswordChangedEvent(id: number, hashedPassword: string) {
    return this.client.emit('user.password.changed', { id, hashedPassword });
  }

  async emitUserUpdatedEvent(id: number, updateUserDto: UpdateUserDto) {
    return this.client.emit('user.updated', { id, updateUserDto });
  }

  async emitUpdatedRoleEvent(id: number, updateUserDto: UpdateUserDto) {
    return this.client.emit('user.role.updated', { id, updateUserDto });
  }

  // Branch

  async emitBranchDeletedEvent(id: number) {
    return this.client.emit('branch.deleted', { id });
  }

  async emitBranchUpdatedEvent(id: number, updateBranchDto: UpdateBranchDto) {
    return this.client.emit('branch.updated', { id, updateBranchDto });
  }
}
