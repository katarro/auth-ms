import { Controller } from '@nestjs/common';
import { LoginDto } from 'src/common/dto/login.dto';
import { AuthUserService } from './auth.user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { UpdateRoleDto, UpdateUserDto } from 'src/common/dto';

@Controller('auth/usuarios')
export class AuthUserController {
  constructor(private readonly authService: AuthUserService) {}

  //sincornizado
  @MessagePattern('register.user.auth')
  async register(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  //no necesita sincornizar
  @MessagePattern('login.user.auth')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @MessagePattern('verify.token')
  async verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }

  // sincronizado
  @MessagePattern('change.password')
  async changePassword(
    @Payload() payload: { id: number; changePasswordDto: ChangePasswordDto },
  ) {
    return this.authService.changePassword(
      payload.id,
      payload.changePasswordDto,
    );
  }

  @MessagePattern('get.users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @MessagePattern('get.user.by.id')
  async getUserById(@Payload() payload: { id: number }) {
    return this.authService.getUserById(payload.id);
  }

  
  @MessagePattern('reset.password')
  async forgotPassword(@Payload() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload.email);
  }
  
  //***************************************** */

  //sincronizar
  @MessagePattern('update.user')
  async updateUser(
    @Payload() payload: { id: number; updateUserDto: UpdateUserDto },
  ) {
    return this.authService.updateUser(payload.id, payload.updateUserDto);
  }

  //sincronizar
  @MessagePattern('update.role')
  async updateRole(
    @Payload() payload: { id: number; updateRoleDto: UpdateRoleDto },
  ) {
    return this.authService.updateRole(payload.id, payload.updateRoleDto);
  }
}
