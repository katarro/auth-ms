import { Controller } from '@nestjs/common';
import { AuthUserService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from 'src/common/dto/register.user.dto';
import { AuthGoogle } from './auth.google.service';
import { LoginDto, ResetPasswordDto } from 'src/common/dto';

@Controller('auth')
export class AuthUserController {
  constructor(
    private readonly authService: AuthUserService,
    private readonly googleAuth: AuthGoogle,
  ) {}

  @MessagePattern('test.auth')
  async test(@Payload() payload: any) {
    return { message: 'Test successful', data: payload, status: 200 };
  }

  @MessagePattern('auth.google')
  async authGoogle(@Payload() payload: any) {
    return this.googleAuth.authGoogle(payload);
  }

  @MessagePattern('public.register.user.auth')
  async registerClient(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerClient(registerUserDto);
  }

  @MessagePattern('public.login.user.auth')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @MessagePattern('public.verify.token')
  async verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }

  @MessagePattern('public.reset.password')
  async forgotPassword(@Payload() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload.email);
  }

  // @MessagePattern('change.password')
  // async changePassword(
  //   @Payload() payload: { id: number; changePasswordDto: ChangePasswordDto },
  // ) {
  //   return this.authService.changePassword(
  //     payload.id,
  //     payload.changePasswordDto,
  //   );
  // }

  // @MessagePattern('update.user')
  // async updateUser(
  //   @Payload() payload: { id: number; updateUserDto: UpdateUserDto },
  // ) {
  //   return this.authService.updateUser(payload.id, payload.updateUserDto);
  // }

  // @MessagePattern('update.role')
  // async updateRole(
  //   @Payload() payload: { id: number; updateRoleDto: UpdateRoleDto },
  // ) {
  //   return this.authService.updateRole(payload.id, payload.updateRoleDto);
  // }

  // @MessagePattern('get.users')
  // async getUsers() {
  //   return this.authService.getUsers();
  // }

  // @MessagePattern('get.user.by.id')
  // async getUserById(@Payload() payload: { id: number }) {
  //   return this.authService.getUserById(payload.id);
  // }
}
