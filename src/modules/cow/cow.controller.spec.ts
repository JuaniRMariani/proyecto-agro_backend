import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { AccountRole } from '../user/account-role.enum';
import { CowController } from './cow.controller';
import { CowResponseDto } from './dto/cow-response.dto';
import { CowService } from './cow.service';

type CowServiceMock = jest.Mocked<
  Pick<
    CowService,
    | 'getCowsByUserId'
    | 'getCowById'
    | 'getCowByTagNumber'
    | 'createCow'
    | 'updateCow'
    | 'deleteCow'
    | 'transferOwnership'
    | 'getOwnershipHistory'
    | 'addBodyConditionScore'
    | 'getBcsHistory'
    | 'deleteBcs'
    | 'synchronize'
    | 'overrideBcs'
    | 'revertBcsOverride'
  >
>;

const request: AuthenticatedRequest = {
  user: {
    userId: '11111111-1111-4111-8111-111111111111',
    email: 'producer@example.com',
    role: AccountRole.PRODUCER,
  },
  headers: {},
};

function makeCowResponse(): CowResponseDto {
  return new CowResponseDto({
    id: '22222222-2222-4222-8222-222222222222',
    tagNumber: '123',
    weight: 100,
    location: null,
    userId: request.user.userId,
    bodyConditionScores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('CowController', () => {
  let controller: CowController;
  let cowService: CowServiceMock;

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
      overrideBcs: jest.fn(),
      revertBcsOverride: jest.fn(),
    };

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
      request,
    );

    expect(cowService.synchronize.mock.calls).toContainEqual([
      request.user.userId,
      { cows: [], scores: [] },
    ]);
    expect(result.cows.created).toBe(1);
    expect(result.data).toEqual([]);
  });

  it('gets cows by user id', async () => {
    const cow = makeCowResponse();
    cowService.getCowsByUserId.mockResolvedValue([cow]);

    await expect(controller.getMyCows(request)).resolves.toEqual([cow]);
  });

  it('creates cow', async () => {
    const cow = makeCowResponse();
    cowService.createCow.mockResolvedValue(cow);

    await expect(
      controller.createCow({ tagNumber: '123', weight: 100 }, request),
    ).resolves.toEqual(cow);
  });
});
