import { Controller } from '@nestjs/common';
import { AdminService } from './admin.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateCompanyDto,
  CreateUserDto,
  UpdateCompanyDto,
  UpdateUserDto,
} from 'src/common/dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern('admin.getAllUsers')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @MessagePattern('admin.getUserById')
  async getUserById(@Payload() payload: { id: string }) {
    return this.adminService.getUserById(payload.id);
  }

  @MessagePattern('admin.createUser.adminBusiness')
  async createAdminBusiness(@Payload() data: { createUserDto: CreateUserDto }) {
    const { createUserDto } = data;
    return this.adminService.createAdminBusiness(createUserDto);
  }

  @MessagePattern('admin.createUser.adminBranch')
  async createAdminBranch(@Payload() data: { createUserDto: CreateUserDto }) {
    const { createUserDto } = data;
    return this.adminService.createAdminBranch(createUserDto);
  }

  @MessagePattern('admin.createUser.executive')
  async createExecutive(
    @Payload() data: { createUserDto: CreateUserDto; moduleId: string },
  ) {
    const { createUserDto, moduleId } = data;
    return this.adminService.createExecutive(createUserDto, moduleId);
  }

  @MessagePattern('admin.updateUser')
  async updateUser(
    @Payload() data: { id: string; updateUserDto: UpdateUserDto },
  ) {
    const { id, updateUserDto } = data;
    return this.adminService.updateUser(id, updateUserDto);
  }

  @MessagePattern('admin.deleteUser')
  async deleteUser(@Payload() payload: { id: string }) {
    return this.adminService.deleteUser(payload.id);
  }

  @MessagePattern('admin.getAllCompanies')
  async getAllCompanies() {
    return this.adminService.getAllCompanies();
  }

  @MessagePattern('admin.getCompanyById')
  async getCompanyById(@Payload() data: { id: string }) {
    const { id } = data;
    return this.adminService.getCompanyById(id);
  }

  @MessagePattern('admin.createCompany')
  async createCompany(@Payload() createCompanyDto: CreateCompanyDto) {
    return this.adminService.createCompany(createCompanyDto);
  }

  @MessagePattern('admin.updateCompany')
  async updateCompany(
    @Payload() data: { id: string; updateCompanyDto: UpdateCompanyDto },
  ) {
    const { id, updateCompanyDto } = data;
    return this.adminService.updateCompany(id, updateCompanyDto);
  }

  @MessagePattern('admin.deleteCompany')
  async deleteCompany(@Payload() payload: { id: string }) {
    return this.adminService.deleteCompany(payload.id);
  }

  @MessagePattern('admin.getAllRoles')
  async getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @MessagePattern('admin.getDashboardMetrics')
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }
}
