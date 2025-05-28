import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({
    minSymbols: 0,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
