import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { AccountRole } from '../user/account-role.enum';
import { ProfessionalAccessController } from './professional-access.controller';
import { ProfessionalAccessService } from './professional-access.service';

type ControllerService = Pick<
  ProfessionalAccessService,
  | 'requestAccess'
  | 'listProducerAccess'
  | 'listPendingRequests'
  | 'acceptRequest'
  | 'rejectRequest'
  | 'revokeAccess'
  | 'listClients'
  | 'getClientCows'
>;

describe('ProfessionalAccessController', () => {
  let controller: ProfessionalAccessController;
  let service: jest.Mocked<ControllerService>;

  const request: AuthenticatedRequest = {
    user: {
      userId: '11111111-1111-4111-8111-111111111111',
      email: 'producer@example.com',
      role: AccountRole.PRODUCER,
    },
    headers: {},
  };

  beforeEach(async () => {
    service = {
      requestAccess: jest.fn(),
      listProducerAccess: jest.fn(),
      listPendingRequests: jest.fn(),
      acceptRequest: jest.fn(),
      rejectRequest: jest.fn(),
      revokeAccess: jest.fn(),
      listClients: jest.fn(),
      getClientCows: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalAccessController],
      providers: [{ provide: ProfessionalAccessService, useValue: service }],
    }).compile();
    controller = module.get<ProfessionalAccessController>(
      ProfessionalAccessController,
    );
  });

  it('passes the authenticated actor when creating a request', async () => {
    const dto = { professionalEmail: 'vet@example.com' };

    await controller.requestAccess(request, dto);

    expect(service.requestAccess).toHaveBeenCalledWith(request.user, dto);
  });

  it('passes the professional actor when listing clients', async () => {
    await controller.listClients(request);

    expect(service.listClients).toHaveBeenCalledWith(request.user);
  });

  it('passes both actor and producer id for read-only cows', async () => {
    const producerId = '22222222-2222-4222-8222-222222222222';

    await controller.getClientCows(producerId, request);

    expect(service.getClientCows).toHaveBeenCalledWith(
      request.user,
      producerId,
    );
  });
});
