import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountRole } from '../account-role.enum';
import { Transform } from 'class-transformer';
import { MaxBcryptPasswordBytes } from '../../../common/validation/password-byte-length.validator';
import {
  normalizeEmailTransform,
  trimStringTransform,
} from '../../../common/transforms/normalize-string.transform';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(normalizeEmailTransform)
  @IsEmail({}, { message: 'El correo electrÃ³nico no es vÃ¡lido' })
  @IsNotEmpty({ message: 'El correo electrÃ³nico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Juan Perez' })
  @Transform(trimStringTransform)
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre completo no puede exceder los 100 caracteres',
  })
  fullName: string;

  @ApiPropertyOptional({
    enum: AccountRole,
    default: AccountRole.PRODUCER,
    example: AccountRole.PRODUCER,
  })
  @IsOptional()
  @IsEnum(AccountRole, { message: 'El rol de cuenta no es válido' })
  role?: AccountRole;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({ message: 'La contraseÃ±a debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseÃ±a debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseÃ±a es obligatoria' })
  @MaxBcryptPasswordBytes()
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
  @MaxBcryptPasswordBytes()
  passwordConfirmation?: string;
}
