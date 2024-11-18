import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/common/dto/register-auth.dto';
import { LoginDto } from 'src/common/dto/login-auth.dto';
import { CreateSucursalDto } from 'src/common/dto/create-sucursal.dto';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('register_user_auth')
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @MessagePattern('login_user_auth')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @MessagePattern('register_sucursal_auth')
  async registerSucursal(@Payload() createSucursalDto: CreateSucursalDto) {
    return this.authService.registerSucursal(createSucursalDto);
  }

  @MessagePattern('verify_token')
  async verifyToken(@Payload() token: string){
    return this.authService.verifyToken(token);
  }
}
