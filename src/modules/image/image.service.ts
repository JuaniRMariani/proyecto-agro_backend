import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { BodyConditionScore } from '../cow/body-condition-score.entity';
import { SignatureResponseDto } from './dto/signature-response.dto';

@Injectable()
export class ImageService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly folder: string = 'analysis';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BodyConditionScore)
    private readonly bcsRepository: Repository<BodyConditionScore>,
  ) {
    this.cloudName =
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '';
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') || '';
    this.apiSecret =
      this.configService.get<string>('CLOUDINARY_API_SECRET') || '';

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }

  async generateUploadSignature(
    userId: string,
    scoreId?: string,
    clientId?: string,
  ): Promise<SignatureResponseDto> {
    // If scoreId provided, validate it exists and belongs to user
    if (scoreId) {
      const bcs = await this.bcsRepository.findOne({
        where: { id: scoreId },
        relations: ['cow'],
      });

      if (!bcs) {
        throw new NotFoundException('Body condition score not found');
      }

      if (bcs.cow.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to upload images for this score',
        );
      }
    }

    // If clientId provided (offline-first), validate format but don't require DB record
    if (!scoreId && !clientId) {
      throw new NotFoundException(
        'Either scoreId or clientId must be provided',
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const identifier = scoreId || clientId!;
    const publicId = `analysis_${identifier}`;

    // Generate signature using Cloudinary SDK
    const paramsToSign = {
      timestamp,
      folder: this.folder,
      public_id: publicId,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.apiSecret,
    );

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder: this.folder,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
    };
  }
}
