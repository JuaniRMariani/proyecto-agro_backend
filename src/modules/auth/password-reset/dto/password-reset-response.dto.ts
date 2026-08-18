import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetRequestResponseDto {
  @ApiProperty({ format: 'uuid' })
  requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }
}

export class PasswordResetVerifyResponseDto {
  @ApiProperty({ description: 'Token opaco de un solo uso' })
  resetToken: string;

  constructor(resetToken: string) {
    this.resetToken = resetToken;
  }
}
