import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Matches } from 'class-validator';

export class VerifyPasswordResetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'RequestId debe ser un UUID vÃ¡lido' })
  requestId: string;

  @ApiProperty({ example: '123456', pattern: '^\\d{6}$' })
  @Matches(/^\d{6}$/, {
    message: 'El cÃ³digo debe tener exactamente 6 dÃ­gitos',
  })
  code: string;
}
