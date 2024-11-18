import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from '../../common/dto/register-auth.dto';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsStrongPassword,
  IsUUID,
  Length,
} from 'class-validator';

enum Rol {
  Admin = 'admin',
  Cliente = 'cliente',
  Ejecutivo = 'ejecutivo',
}

export class UpdateDto {
  
  @IsUUID()
  id: string;

  @IsString()
  @Length(3, 20)
  nombre: string;

  @IsEmail()
  correo: string;

  @IsStrongPassword({
    minSymbols: 0,
    minLength: 8,
  })
  contrasena: string;

  @IsEnum(Rol)
  rol: Rol;

  @IsNumber()
  @IsPositive()
  sucursal_id: number;
}
