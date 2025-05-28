import { Controller } from '@nestjs/common';
import { AdminBranchService } from './admin-branch.service';
import { PrismaClient } from '@prisma/client';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateModuleWithQueueDto, CreateUserDto } from 'src/common/dto';

@Controller('admin-sucursal')
export class AdminBranchController extends PrismaClient {
  constructor(private readonly adminBranchService: AdminBranchService) {
    super();
  }
  @MessagePattern('admin.branch.getAllQueues')
  async getAllQueues(@Payload() userId: string) {
    return await this.adminBranchService.getAllQueues(userId);
  }

  @MessagePattern('admin.branch.createModuleWithQueue')
  async createModuleWithQueue(
    @Payload()
    payload: {
      dto: CreateModuleWithQueueDto;
      userId: string;
    },
  ) {
    return await this.adminBranchService.createModuleWithQueue(
      payload.dto,
      payload.userId,
    );
  }

  @MessagePattern('admin.branch.createExecutive')
  async createExecutive(
    @Payload()
    payload: {
      createUserDto: CreateUserDto;
      userId: string;
    },
  ) {
    const { createUserDto, userId } = payload;
    return await this.adminBranchService.createExecutive(createUserDto, userId);
  }

  @MessagePattern('admin.branch.getAllServicesModules')
  async getAllServicesModules(@Payload() userId: string) {
    return await this.adminBranchService.getAllServicesModules(userId);
  }

  @MessagePattern('admin.branch.getAllExecutives')
  async getAllExecutives(@Payload() userId: string) {
    return await this.adminBranchService.getAllExecutives(userId);
  }

  @MessagePattern('admin.branch.getBranchMetrics')
  async getBranchMetrics(@Payload() userId: string) {
    return await this.adminBranchService.getBranchMetrics(userId);
  }
}
