import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ImageService } from './image.service';
import { BodyConditionScore } from '../cow/body-condition-score.entity';

describe('ImageService', () => {
  let service: ImageService;
  let bcsRepository: Repository<BodyConditionScore>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    }),
  };

  const mockBcsRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(BodyConditionScore),
          useValue: mockBcsRepository,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    bcsRepository = module.get<Repository<BodyConditionScore>>(
      getRepositoryToken(BodyConditionScore),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateUploadSignature', () => {
    const userId = 'user-123';
    const scoreId = 'score-456';
    const mockBcs = {
      id: scoreId,
      score: 3,
      cow: {
        id: 'cow-123',
        userId: userId,
        tagNumber: '530',
      },
    };

    it('should generate upload signature successfully', async () => {
      mockBcsRepository.findOne.mockResolvedValue(mockBcs);

      const result = await service.generateUploadSignature(userId, scoreId);

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('apiKey', 'test-key');
      expect(result).toHaveProperty('cloudName', 'test-cloud');
      expect(result).toHaveProperty('folder', 'analysis');
      expect(result).toHaveProperty('publicId', `analysis_${scoreId}`);
      expect(result).toHaveProperty('uploadUrl', 'https://api.cloudinary.com/v1_1/test-cloud/image/upload');
      expect(mockBcsRepository.findOne).toHaveBeenCalledWith({
        where: { id: scoreId },
        relations: ['cow'],
      });
    });

    it('should throw NotFoundException when score does not exist', async () => {
      mockBcsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateUploadSignature(userId, scoreId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when score does not belong to user', async () => {
      const differentUserId = 'different-user-789';
      mockBcsRepository.findOne.mockResolvedValue(mockBcs);

      await expect(
        service.generateUploadSignature(differentUserId, scoreId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should generate valid signature format', async () => {
      mockBcsRepository.findOne.mockResolvedValue(mockBcs);

      const result = await service.generateUploadSignature(userId, scoreId);

      expect(typeof result.signature).toBe('string');
      expect(result.signature.length).toBeGreaterThan(0);
      expect(typeof result.timestamp).toBe('number');
      expect(result.timestamp).toBeGreaterThan(0);
    });
  });
});
