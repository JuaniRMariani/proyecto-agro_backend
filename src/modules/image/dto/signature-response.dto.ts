import { ApiProperty } from '@nestjs/swagger';

export class SignatureResponseDto {
  @ApiProperty({
    example: 'abc123xyz',
    description: 'Cloudinary signature for upload authentication',
  })
  signature: string;

  @ApiProperty({
    example: 1730000000,
    description: 'Unix timestamp when the signature was generated',
  })
  timestamp: number;

  @ApiProperty({
    example: '123456789012345',
    description: 'Cloudinary API key',
  })
  apiKey: string;

  @ApiProperty({
    example: 'my-cloud-name',
    description: 'Cloudinary cloud name',
  })
  cloudName: string;

  @ApiProperty({
    example: 'analysis',
    description: 'Cloudinary folder where images will be stored',
  })
  folder: string;

  @ApiProperty({
    example: 'analysis_73583dc2-e179-4931-b495-1f85c1382152',
    description: 'Public ID for the image in Cloudinary',
  })
  publicId: string;

  @ApiProperty({
    example: 'https://api.cloudinary.com/v1_1/my-cloud-name/image/upload',
    description: 'URL to upload the image to',
  })
  uploadUrl: string;
}
