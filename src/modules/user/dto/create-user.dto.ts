import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El correo electrÃ³nico no es vÃ¡lido' })
  @IsNotEmpty({ message: 'El correo electrÃ³nico es obligatorio' })
  email: string;

  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'El nombre completo no puede exceder los 100 caracteres',
  })
  fullName: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({ message: 'La contraseÃ±a debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseÃ±a debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseÃ±a es obligatoria' })
  password: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({
    message: 'La confirmaciÃ³n de la contraseÃ±a debe ser una cadena de texto',
  })
  @MinLength(6, {
    message:
      'La confirmaciÃ³n de la contraseÃ±a debe tener al menos 6 caracteres',
  })
  @IsNotEmpty({ message: 'La confirmaciÃ³n de la contraseÃ±a es obligatoria' })
  passwordConfirmation?: string;
}
