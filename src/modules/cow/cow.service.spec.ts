import { ConflictException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CowService } from './cow.service';
import { ICowRepository } from './infra/cow.repository';

describe('CowService', () => {
  let service: CowService;
  let cowRepository: jest.Mocked<ICowRepository>;

  beforeEach(async () => {
    cowRepository = {
      findAll: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByIdWithBcs: jest.fn(),
      findByTagNumber: jest.fn(),
      findByTagNumberIncludingDeleted: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      transferOwnership: jest.fn(),
      addBodyConditionScore: jest.fn(),
      syncBodyConditionScore: jest.fn(),
      findBcsHistory: jest.fn(),
      deleteBcs: jest.fn(),
      findOwnershipHistory: jest.fn(),
    };
    cowRepository.findAllByUserId.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CowService,
        { provide: 'ICowRepository', useValue: cowRepository },
      ],
    }).compile();

    service = module.get<CowService>(CowService);
  });

  it('throws conflict when creating a cow with existing tag number', async () => {
    cowRepository.findByTagNumber.mockResolvedValue({ id: 'cow-1' } as any);
    await expect(
      service.createCow({ tagNumber: '123', weight: 100 }, 'user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('synchronizes cows: deletes when marked deleted', async () => {
    cowRepository.findByTagNumberIncludingDeleted.mockResolvedValue({
      id: 'cow-1',
      userId: 'user-1',
    } as any);

    const result = await service.synchronize('user-1', {
      cows: [{ tagNumber: '123', deleted: true }],
      scores: [],
    });

    expect(cowRepository.delete).toHaveBeenCalledWith('cow-1', 'user-1');
    expect(result.cows.deleted).toBe(1);
    expect(result.data).toEqual([]);
  });

  it('synchronizes cows: skips older updates', async () => {
    cowRepository.findByTagNumberIncludingDeleted.mockResolvedValue({
      id: 'cow-1',
      userId: 'user-1',
      updatedAt: new Date(2000),
    } as any);

    const result = await service.synchronize('user-1', {
      cows: [{ tagNumber: '123', updatedAt: 1000 }],
      scores: [],
    });

    expect(cowRepository.update).not.toHaveBeenCalled();
    expect(result.cows.skipped).toBe(1);
  });

  it('synchronizes cows: creates when not found', async () => {
    cowRepository.findByTagNumberIncludingDeleted.mockResolvedValue(null);
    const result = await service.synchronize('user-1', {
      cows: [{ tagNumber: '123', weight: 200 }],
      scores: [],
    });

    expect(cowRepository.create).toHaveBeenCalled();
    expect(result.cows.created).toBe(1);
  });

  it('synchronizes scores: deletes when marked deleted with id', async () => {
    const result = await service.synchronize('user-1', {
      cows: [],
      scores: [{ id: 'bcs-1', cowTagNumber: '123', deleted: true }],
    });

    expect(cowRepository.deleteBcs).toHaveBeenCalledWith('bcs-1', 'user-1');
    expect(result.scores.deleted).toBe(1);
  });

  it('synchronizes scores: throws when required fields missing', async () => {
    await expect(
      service.synchronize('user-1', {
        cows: [],
        scores: [{ cowTagNumber: '123' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('synchronizes scores: creates or updates for existing cow', async () => {
    cowRepository.findByTagNumber.mockResolvedValue({
      id: 'cow-1',
      userId: 'user-1',
    } as any);
    cowRepository.syncBodyConditionScore.mockResolvedValue({
      bcs: { id: 'bcs-1' } as any,
      created: true,
    });

    const result = await service.synchronize('user-1', {
      cows: [],
      scores: [
        {
          cowTagNumber: '123',
          score: 3,
          recordedAt: 1000,
        },
      ],
    });

    expect(cowRepository.syncBodyConditionScore).toHaveBeenCalled();
    expect(result.scores.created).toBe(1);
  });

  it('synchronizes cows: updates when newer timestamp', async () => {
    cowRepository.findByTagNumberIncludingDeleted.mockResolvedValue({
      id: 'cow-1',
      userId: 'user-1',
      updatedAt: new Date(1000),
    } as any);

    const result = await service.synchronize('user-1', {
      cows: [{ tagNumber: '123', updatedAt: 2000, weight: 300 }],
      scores: [],
    });

    expect(cowRepository.update).toHaveBeenCalled();
    expect(result.cows.updated).toBe(1);
  });

  it('synchronizes cows: conflicts on tagNumber owned by another user', async () => {
    cowRepository.findByTagNumberIncludingDeleted.mockResolvedValue({
      id: 'cow-1',
      userId: 'user-2',
    } as any);

    await expect(
      service.synchronize('user-1', {
        cows: [{ tagNumber: '123', weight: 100 }],
        scores: [],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('synchronizes scores: skips when cow not found', async () => {
    cowRepository.findByTagNumber.mockResolvedValue(null);

    const result = await service.synchronize('user-1', {
      cows: [],
      scores: [{ cowTagNumber: 'missing', score: 2, recordedAt: 1000 }],
    });

    expect(result.scores.skipped).toBe(1);
  });

  it('synchronizes scores: skips delete without id', async () => {
    const result = await service.synchronize('user-1', {
      cows: [],
      scores: [{ cowTagNumber: '123', deleted: true }],
    });

    expect(result.scores.skipped).toBe(1);
  });
});
