import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestProfessionalAccessDto {
  @ApiProperty({ example: 'veterinario@example.com' })
  @IsEmail({}, { message: 'El correo del profesional no es válido' })
  @IsNotEmpty({ message: 'El correo del profesional es obligatorio' })
  professionalEmail: string;
}
