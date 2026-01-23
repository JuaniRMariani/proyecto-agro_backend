import { Test, TestingModule } from '@nestjs/testing';
import { CowController } from './cow.controller';
import { CowService } from './cow.service';

describe('CowController', () => {
  let controller: CowController;
  let cowService: jest.Mocked<CowService>;

  beforeEach(async () => {
    cowService = {
      getCowsByUserId: jest.fn(),
      getCowById: jest.fn(),
      getCowByTagNumber: jest.fn(),
      createCow: jest.fn(),
      updateCow: jest.fn(),
      deleteCow: jest.fn(),
      transferOwnership: jest.fn(),
      getOwnershipHistory: jest.fn(),
      addBodyConditionScore: jest.fn(),
      getBcsHistory: jest.fn(),
      deleteBcs: jest.fn(),
      synchronize: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CowController],
      providers: [{ provide: CowService, useValue: cowService }],
    }).compile();

    controller = module.get<CowController>(CowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls synchronize', async () => {
    cowService.synchronize.mockResolvedValue({
      cows: { created: 1, updated: 0, deleted: 0, skipped: 0 },
      scores: { created: 0, updated: 0, deleted: 0, skipped: 0 },
      data: [],
    });

    const result = await controller.synchronize(
      { cows: [], scores: [] },
      { user: { userId: 'user-1' } } as any,
    );

    expect(cowService.synchronize).toHaveBeenCalledWith('user-1', {
      cows: [],
      scores: [],
    });
    expect(result.cows.created).toBe(1);
    expect(result.data).toEqual([]);
  });

  it('gets cows by user id', async () => {
    cowService.getCowsByUserId.mockResolvedValue([
      { id: 'cow-1', tagNumber: '123' },
    ] as any);

    await expect(controller.getMyCows({ user: { userId: 'user-1' } } as any)).resolves.toEqual(
      [{ id: 'cow-1', tagNumber: '123' }],
    );
  });

  it('creates cow', async () => {
    cowService.createCow.mockResolvedValue({
      id: 'cow-1',
      tagNumber: '123',
    } as any);

    await expect(
      controller.createCow({ tagNumber: '123', weight: 100 } as any, {
        user: { userId: 'user-1' },
      } as any),
    ).resolves.toEqual({ id: 'cow-1', tagNumber: '123' });
  });
});
