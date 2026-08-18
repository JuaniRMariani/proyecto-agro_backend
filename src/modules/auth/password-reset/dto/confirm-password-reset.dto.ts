import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { MaxBcryptPasswordBytes } from '../../../../common/validation/password-byte-length.validator';

export class ConfirmPasswordResetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'RequestId debe ser un UUID vÃ¡lido' })
  requestId: string;

  @ApiProperty({ description: 'Token opaco entregado al verificar el cÃ³digo' })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(6)
  @MaxBcryptPasswordBytes()
  password: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(6)
  @MaxBcryptPasswordBytes()
  passwordConfirmation: string;
}
