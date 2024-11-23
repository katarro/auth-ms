import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { Role } from 'src/auth/enums';
export class UpdateUserDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @Length(3, 20)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsStrongPassword({
    minSymbols: 0,
    minLength: 8,
  })
  @IsOptional()
  password?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
