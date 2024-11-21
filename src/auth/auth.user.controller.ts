import { Controller } from '@nestjs/common';
import { LoginDto } from 'src/common/dto/login.dto';
import { AuthUserService } from './auth.user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';

@Controller('auth/usuarios')
export class AuthUserController {
  constructor(
    private readonly authService: AuthUserService) {}

  @MessagePattern('register.user.auth')
  async register(@Payload() registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @MessagePattern('login.user.auth')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
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
