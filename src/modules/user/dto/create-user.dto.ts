import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'El nombre completo no puede exceder los 100 caracteres',
  })
  fullName: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsString({
    message: 'La confirmación de la contraseña debe ser una cadena de texto',
  })
  @MinLength(6, {
    message:
      'La confirmación de la contraseña debe tener al menos 6 caracteres',
  })
  @IsNotEmpty({ message: 'La confirmación de la contraseña es obligatoria' })
  passwordConfirmation?: string;
}
