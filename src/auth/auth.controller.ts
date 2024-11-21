import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { CreateBranchDto } from 'src/common/dto/create-branch.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('register.user.auth')
  async register(@Payload() registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @MessagePattern('login.user.auth')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @MessagePattern('register.sucursal.auth')
  async registerSucursal(
    @Payload() payload: { createBranchDto: CreateBranchDto; token: string },
  ) {
    const { createBranchDto, token } = payload;
    return this.authService.registerSucursal(createBranchDto, token);
  }

  @MessagePattern('verify.token')
  async verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }

  @MessagePattern('change.password')
  async changePassword(
    @Payload() payload: { id: number; changePasswordDto: ChangePasswordDto },
  ) {
    const { id, changePasswordDto } = payload;
    return this.authService.changePassword(id, changePasswordDto);
  }

  @MessagePattern('reset.password')
  async forgotPassword(@Payload() payload: ResetPasswordDto) {
    const { email } = payload;
    return this.authService.resetPassword(email);
  }
}
