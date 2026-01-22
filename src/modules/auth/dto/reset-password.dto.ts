import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString({ message: 'El cÃ³digo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El cÃ³digo es obligatorio' })
  code: string;

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
  passwordConfirmation: string;
}
