import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ImageService } from './image.service';
import { SignatureRequestDto } from './dto/signature-request.dto';
import { SignatureResponseDto } from './dto/signature-response.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

interface AuthenticatedRequest {
  user: {
    userId: string;
    username: string;
  };
}

@ApiTags('images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('signature')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Cloudinary upload signature' })
  @ApiResponse({
    status: 201,
    description: 'Signature generated successfully',
    type: SignatureResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Score not found' })
  @ResponseMessage('Signature generated successfully')
  async generateSignature(
    @Request() req: AuthenticatedRequest,
    @Body() signatureRequest: SignatureRequestDto,
  ): Promise<SignatureResponseDto> {
    return this.imageService.generateUploadSignature(
      req.user.userId,
      signatureRequest.scoreId,
      signatureRequest.clientId,
    );
  }
}
