import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El correo electrÃ³nico no es vÃ¡lido' })
  @IsNotEmpty({ message: 'El correo electrÃ³nico es obligatorio' })
  email: string;
}
