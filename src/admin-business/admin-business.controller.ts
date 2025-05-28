import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminBusinessService } from './admin-business.service';
import {
  CreateBranchDto,
  CreateUserDto,
  UpdateBranchDto,
  UpdateUserDto,
} from 'src/common/dto';

@Controller('admin-empresa')
export class AdminBusinessController {
  constructor(private readonly adminBusinessService: AdminBusinessService) {}

  @MessagePattern('admin.business.getAllBranches')
  async getAllBranches(@Payload() idAdminBusiness: string) {
    return this.adminBusinessService.getAllBranches(idAdminBusiness);
  }
  @MessagePattern('admin.business.getBranchById')
  async getBranchById(
    @Payload() payload: { idBranch: string; userId: string },
  ) {
    const { idBranch, userId } = payload;
    return this.adminBusinessService.getBranchById(idBranch, userId);
  }

  @MessagePattern('admin.business.createBranch')
  async createBranch(
    @Payload()
    payload: {
      createBranchDto: CreateBranchDto;
      userId: string;
    },
  ) {
    const { createBranchDto, userId } = payload;
    return this.adminBusinessService.createBranch(createBranchDto, userId);
  }

  @MessagePattern('admin.business.createBranchAdmin')
  async createBranchAdmin(
    @Payload() payload: { createUserDto: CreateUserDto; userId: string },
  ) {
    const { createUserDto, userId } = payload;
    return this.adminBusinessService.createBranchAdmin(createUserDto, userId);
  }

  @MessagePattern('admin.business.updateBranch')
  async updateBranch(
    @Payload() payload: { idBranch: string; updateBranchDto: UpdateBranchDto },
  ) {
    const { idBranch, updateBranchDto } = payload;
    return this.adminBusinessService.updateBranch(idBranch, updateBranchDto);
  }

  @MessagePattern('admin.business.deleteBranch')
  async deleteBranch(@Payload() idBranch: string) {
    return this.adminBusinessService.deleteBranch(idBranch);
  }

  @MessagePattern('admin.business.getAllBranchAdmins')
  async getAllBranchAdmins(@Payload() userId: string) {
    return this.adminBusinessService.getAllBranchAdmins(userId);
  }

  @MessagePattern('admin.business.getBusinessMetrics')
  async getBusinessMetrics(@Payload() idAdminBusiness: string) {
    return this.adminBusinessService.getBusinessMetrics(idAdminBusiness);
  }

  @MessagePattern('admin.business.updateBranchAdmin')
  async updateBranchAdmin(
    @Payload()
    payload: {
      idAdminBusiness: string;
      idAdminBranch: string;
      updateUserDto: UpdateUserDto;
    },
  ) {
    const { idAdminBranch, idAdminBusiness, updateUserDto } = payload;
    return this.adminBusinessService.updateBranchAdmin(
      idAdminBusiness,
      idAdminBranch,
      updateUserDto,
    );
  }
}
