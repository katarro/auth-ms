import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateBranchDto } from 'src/common/dto/create-branch.dto';
import { AuthBranchService } from './auth.branch.service';
import { UpdateBranchDto } from 'src/common/dto';

@Controller('auth/sucursales')
export class AuthBranchController {
  constructor(private readonly branchesService: AuthBranchService) {}

  @MessagePattern('register.branch.auth')
  async registerBranch(
    @Payload() payload: { createBranchDto: CreateBranchDto; token: string },
  ) {
    const { createBranchDto, token } = payload;
    return this.branchesService.registerBranch(createBranchDto, token);
  }

  @MessagePattern('delete.branch')
  async deleteBranch(@Payload() id: number) {
    return this.branchesService.deleteBranch(id);
  }

  @MessagePattern('update.branch')
  async updateBranch(
    @Payload() payload: { id: number; updateBranchDto: UpdateBranchDto },
  ) {
    const { id, updateBranchDto } = payload;
    return this.branchesService.updateBranch(id, updateBranchDto);
  }
}
