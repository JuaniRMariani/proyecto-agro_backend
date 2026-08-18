import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaxBcryptPasswordBytes } from '../../../common/validation/password-byte-length.validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'El nombre completo no puede exceder los 100 caracteres',
  })
  fullName?: string;

  @ApiPropertyOptional({ example: 'StrongPass123' })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxBcryptPasswordBytes()
  password?: string;

  @ApiPropertyOptional({ example: 'StrongPass123' })
  @IsOptional()
  @IsString({
    message: 'La confirmación de la contraseña debe ser una cadena de texto',
  })
  @MinLength(6, {
    message:
      'La confirmación de la contraseña debe tener al menos 6 caracteres',
  })
  @MaxBcryptPasswordBytes()
  passwordConfirmation?: string;
}
