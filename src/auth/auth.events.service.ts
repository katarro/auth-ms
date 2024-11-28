import { NATS_SERVICES } from 'src/config';
import {
  CreateBranchDto,
  RegisterUserDto,
  UpdateBranchDto,
  UpdateRoleDto,
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
    return this.client.emit('register.user.branch', registerUserDto);
  }

  async emitPasswordChangedEvent(id: number, hashedPassword: string) {
    return this.client.emit('change.password.branch', { id, hashedPassword });
  }

  async emitUserUpdatedEvent(id: number, updateUserDto: UpdateUserDto) {
    return this.client.emit('user.update.branch', { id, updateUserDto });
  }

  async emitUpdatedRoleEvent(id: number, updateRoleDto: UpdateRoleDto) {
    return this.client.emit('user.role.update.branch', { id, updateRoleDto });
  }

  // Branch

  async emitBranchCreatedEvent(createBranchDto: CreateBranchDto) {
    return this.client.emit('branch.create.branch', createBranchDto);
  }

  async emitBranchDeletedEvent(id: number) {
    return this.client.emit('branch.delete.branch', { id });
  }

  async emitBranchUpdatedEvent(id: number, updateBranchDto: UpdateBranchDto) {
    return this.client.emit('branch.update.branch', { id, updateBranchDto });
  }
}
