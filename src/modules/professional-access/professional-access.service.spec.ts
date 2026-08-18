import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from '../../common/auth/authenticated-request.interface';
import { CowService } from '../cow/cow.service';
import { AccountRole } from '../user/account-role.enum';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import type { IProfessionalAccessRepository } from './infra/professional-access.repository';
import { ProfessionalAccessStatus } from './professional-access-status.enum';
import { ProfessionalAccess } from './professional-access.entity';
import { ProfessionalAccessService } from './professional-access.service';

type AccessUserService = Pick<UserService, 'getUserById' | 'getUserByEmail'>;
type AccessCowService = Pick<CowService, 'getCowsByUserId'>;

const producerActor: AuthenticatedUser = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'producer@example.com',
  role: AccountRole.PRODUCER,
};

const professionalActor: AuthenticatedUser = {
  userId: '22222222-2222-4222-8222-222222222222',
  email: 'vet@example.com',
  role: AccountRole.VETERINARIAN,
};

function makeUser(actor: AuthenticatedUser, fullName: string): User {
  const user = new User();
  user.id = actor.userId;
  user.email = actor.email;
  user.fullName = fullName;
  user.role = actor.role;
  return user;
}

function makeAccess(
  status: ProfessionalAccessStatus,
  producer = makeUser(producerActor, 'Productor'),
  professional = makeUser(professionalActor, 'Veterinaria'),
): ProfessionalAccess {
  const access = new ProfessionalAccess();
  access.id = '33333333-3333-4333-8333-333333333333';
  access.producerId = producer.id;
  access.professionalId = professional.id;
  access.producer = producer;
  access.professional = professional;
  access.status = status;
  access.respondedAt = null;
  access.revokedAt = null;
  access.createdAt = new Date('2026-08-18T18:00:00.000Z');
  access.updatedAt = new Date('2026-08-18T18:00:00.000Z');
  return access;
}

describe('ProfessionalAccessService', () => {
  let service: ProfessionalAccessService;
  let accessRepository: jest.Mocked<IProfessionalAccessRepository>;
  let userService: jest.Mocked<AccessUserService>;
  let cowService: jest.Mocked<AccessCowService>;

  beforeEach(async () => {
    accessRepository = {
      findById: jest.fn(),
      findByPair: jest.fn(),
      findForProducer: jest.fn(),
      findPendingForProfessional: jest.fn(),
      findActiveForProfessional: jest.fn(),
      findActivePair: jest.fn(),
      create: jest.fn((partial: Partial<ProfessionalAccess>) => {
        const access = makeAccess(ProfessionalAccessStatus.PENDING);
        Object.assign(access, partial);
        return access;
      }),
      save: jest.fn((access: ProfessionalAccess) => Promise.resolve(access)),
    };
    userService = {
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
    };
    cowService = { getCowsByUserId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalAccessService,
        {
          provide: 'IProfessionalAccessRepository',
          useValue: accessRepository,
        },
        { provide: UserService, useValue: userService },
        { provide: CowService, useValue: cowService },
      ],
    }).compile();

    service = module.get<ProfessionalAccessService>(ProfessionalAccessService);
  });

  it('creates a pending request from a producer to a veterinarian', async () => {
    userService.getUserById.mockResolvedValue({
      id: producerActor.userId,
      fullName: 'Productor',
      email: producerActor.email,
      role: AccountRole.PRODUCER,
    });
    userService.getUserByEmail.mockResolvedValue({
      id: professionalActor.userId,
      fullName: 'Veterinaria',
      email: professionalActor.email,
      role: AccountRole.VETERINARIAN,
    });
    accessRepository.findByPair.mockResolvedValue(null);

    const response = await service.requestAccess(producerActor, {
      professionalEmail: professionalActor.email,
    });

    expect(response.status).toBe(ProfessionalAccessStatus.PENDING);
    expect(response.producer.id).toBe(producerActor.userId);
    expect(response.professional.id).toBe(professionalActor.userId);
    expect(accessRepository.save.mock.calls).toHaveLength(1);
  });

  it('does not allow a professional to create producer requests', async () => {
    await expect(
      service.requestAccess(professionalActor, {
        professionalEmail: 'other@example.com',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(userService.getUserByEmail).not.toHaveBeenCalled();
  });

  it('rejects a target account that is not professional', async () => {
    userService.getUserById.mockResolvedValue({
      id: producerActor.userId,
      fullName: 'Productor',
      email: producerActor.email,
      role: AccountRole.PRODUCER,
    });
    userService.getUserByEmail.mockResolvedValue({
      id: '44444444-4444-4444-8444-444444444444',
      fullName: 'Otro productor',
      email: 'other@example.com',
      role: AccountRole.PRODUCER,
    });

    await expect(
      service.requestAccess(producerActor, {
        professionalEmail: 'other@example.com',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not duplicate a pending or active relationship', async () => {
    userService.getUserById.mockResolvedValue({
      id: producerActor.userId,
      fullName: 'Productor',
      email: producerActor.email,
      role: AccountRole.PRODUCER,
    });
    userService.getUserByEmail.mockResolvedValue({
      id: professionalActor.userId,
      fullName: 'Veterinaria',
      email: professionalActor.email,
      role: AccountRole.VETERINARIAN,
    });
    accessRepository.findByPair.mockResolvedValue(
      makeAccess(ProfessionalAccessStatus.ACTIVE),
    );

    await expect(
      service.requestAccess(producerActor, {
        professionalEmail: professionalActor.email,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows only the addressed professional to accept a pending request', async () => {
    const pending = makeAccess(ProfessionalAccessStatus.PENDING);
    accessRepository.findById.mockResolvedValue(pending);

    const response = await service.acceptRequest(professionalActor, pending.id);

    expect(response.status).toBe(ProfessionalAccessStatus.ACTIVE);
    expect(pending.respondedAt).toBeInstanceOf(Date);
  });

  it('hides a request addressed to another professional', async () => {
    const pending = makeAccess(ProfessionalAccessStatus.PENDING);
    accessRepository.findById.mockResolvedValue(pending);
    const otherProfessional: AuthenticatedUser = {
      ...professionalActor,
      userId: '55555555-5555-4555-8555-555555555555',
    };

    await expect(
      service.rejectRequest(otherProfessional, pending.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lets the addressed professional reject a pending request', async () => {
    const pending = makeAccess(ProfessionalAccessStatus.PENDING);
    accessRepository.findById.mockResolvedValue(pending);

    const response = await service.rejectRequest(professionalActor, pending.id);

    expect(response.status).toBe(ProfessionalAccessStatus.REJECTED);
  });

  it('lets only the producer revoke its relationship', async () => {
    const active = makeAccess(ProfessionalAccessStatus.ACTIVE);
    accessRepository.findById.mockResolvedValue(active);

    await service.revokeAccess(producerActor, active.id);

    expect(active.status).toBe(ProfessionalAccessStatus.REVOKED);
    expect(active.revokedAt).toBeInstanceOf(Date);
  });

  it('hides another producer relationship during revoke', async () => {
    const active = makeAccess(ProfessionalAccessStatus.ACTIVE);
    accessRepository.findById.mockResolvedValue(active);
    const otherProducer = {
      ...producerActor,
      userId: '66666666-6666-4666-8666-666666666666',
    };

    await expect(
      service.revokeAccess(otherProducer, active.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists only clients from active relationships', async () => {
    accessRepository.findActiveForProfessional.mockResolvedValue([
      makeAccess(ProfessionalAccessStatus.ACTIVE),
    ]);

    const clients = await service.listClients(professionalActor);

    expect(clients).toEqual([
      {
        id: producerActor.userId,
        fullName: 'Productor',
        email: producerActor.email,
        role: AccountRole.PRODUCER,
        accessId: '33333333-3333-4333-8333-333333333333',
      },
    ]);
  });

  it('returns client cows only through an active relationship', async () => {
    accessRepository.findActivePair.mockResolvedValue(
      makeAccess(ProfessionalAccessStatus.ACTIVE),
    );
    cowService.getCowsByUserId.mockResolvedValue([]);

    await expect(
      service.getClientCows(professionalActor, producerActor.userId),
    ).resolves.toEqual([]);
    expect(cowService.getCowsByUserId).toHaveBeenCalledWith(
      producerActor.userId,
    );
  });

  it('does not reveal cows without an active relationship', async () => {
    accessRepository.findActivePair.mockResolvedValue(null);

    await expect(
      service.getClientCows(professionalActor, producerActor.userId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(cowService.getCowsByUserId).not.toHaveBeenCalled();
  });
});
