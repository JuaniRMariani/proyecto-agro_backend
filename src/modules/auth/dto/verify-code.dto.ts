import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({ example: '123456' })
  @IsString({ message: 'El cÃ³digo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El cÃ³digo es obligatorio' })
  code: string;
}
