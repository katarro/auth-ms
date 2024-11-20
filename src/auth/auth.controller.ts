import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/common/dto/register-auth.dto';
import { LoginDto } from 'src/common/dto/login-auth.dto';
import { CreateSucursalDto } from 'src/common/dto/create-sucursal.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { ForgotPassword } from 'src/common/dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('register.user.auth')
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @MessagePattern('login.user.auth')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @MessagePattern('register.sucursal.auth')
  async registerSucursal(
    @Payload() payload: { createSucursalDto: CreateSucursalDto; token: string },
  ) {
    const { createSucursalDto, token } = payload;
    return this.authService.registerSucursal(createSucursalDto, token);
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

  @MessagePattern('forgot.password')
  async forgotPassword(@Payload() payload: ForgotPassword) {
    const { correo } = payload;
    return this.authService.forgotPassword(correo);
  }
}
