import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/common/dto';

@Injectable()
export class CreateBranchAdminCommand {
  async execute(createUserDto: CreateUserDto) {}
}
