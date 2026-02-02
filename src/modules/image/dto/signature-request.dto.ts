import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SignatureRequestDto {
  @ApiProperty({
    example: '73583dc2-e179-4931-b495-1f85c1382152',
    description:
      'The ID of the body condition score (analysis) to upload image for',
  })
  @IsNotEmpty({ message: 'Score ID is required' })
  @IsUUID('4', { message: 'Score ID must be a valid UUID' })
  scoreId: string;
}
