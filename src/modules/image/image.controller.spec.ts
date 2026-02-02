import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { SignatureRequestDto } from './dto/signature-request.dto';
import { SignatureResponseDto } from './dto/signature-response.dto';

describe('ImageController', () => {
  let controller: ImageController;
  let service: ImageService;

  const mockImageService = {
    generateUploadSignature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    service = module.get<ImageService>(ImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateSignature', () => {
    const mockRequest = {
      user: {
        userId: 'user-123',
        username: 'testuser',
      },
    };

    const signatureRequest: SignatureRequestDto = {
      scoreId: 'score-456',
    };

    const mockSignatureResponse: SignatureResponseDto = {
      signature: 'test-signature',
      timestamp: 1730000000,
      apiKey: 'test-key',
      cloudName: 'test-cloud',
      folder: 'analysis',
      publicId: 'analysis_score-456',
      uploadUrl: 'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
    };

    it('should generate signature successfully', async () => {
      mockImageService.generateUploadSignature.mockResolvedValue(
        mockSignatureResponse,
      );

      const result = await controller.generateSignature(
        mockRequest,
        signatureRequest,
      );

      expect(result).toEqual(mockSignatureResponse);
      expect(mockImageService.generateUploadSignature).toHaveBeenCalledWith(
        mockRequest.user.userId,
        signatureRequest.scoreId,
      );
    });

    it('should call service with correct parameters', async () => {
      mockImageService.generateUploadSignature.mockResolvedValue(
        mockSignatureResponse,
      );

      await controller.generateSignature(mockRequest, signatureRequest);

      expect(mockImageService.generateUploadSignature).toHaveBeenCalledTimes(1);
      expect(mockImageService.generateUploadSignature).toHaveBeenCalledWith(
        'user-123',
        'score-456',
      );
    });
  });
});
