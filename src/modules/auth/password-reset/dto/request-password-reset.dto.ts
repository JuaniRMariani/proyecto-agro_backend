import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { normalizeEmailTransform } from '../../../../common/transforms/normalize-string.transform';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(normalizeEmailTransform)
  @IsEmail({}, { message: 'El correo electrÃ³nico no es vÃ¡lido' })
  @IsNotEmpty({ message: 'El correo electrÃ³nico es obligatorio' })
  email: string;
}
