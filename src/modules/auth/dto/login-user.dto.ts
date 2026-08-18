import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { normalizeEmailTransform } from '../../../common/transforms/normalize-string.transform';

export class LoginUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(normalizeEmailTransform)
  @IsEmail({}, { message: 'El correo electrÃ³nico no es vÃ¡lido' })
  @IsNotEmpty({ message: 'El correo electrÃ³nico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({ message: 'La contraseÃ±a debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseÃ±a es obligatoria' })
  password: string;
}
