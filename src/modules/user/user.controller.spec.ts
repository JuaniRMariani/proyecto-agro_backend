import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { AccountRole } from './account-role.enum';
import { UserController } from './user.controller';
import { UserService } from './user.service';

type UserControllerService = Pick<
  UserService,
  'getUserById' | 'updateUser' | 'deleteUser'
>;

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserControllerService>;

  const request: AuthenticatedRequest = {
    user: {
      userId: '11111111-1111-4111-8111-111111111111',
      email: 'producer@example.com',
      role: AccountRole.PRODUCER,
    },
    headers: {},
  };

  beforeEach(async () => {
    userService = {
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('returns only the authenticated profile', async () => {
    const profile = {
      id: request.user.userId,
      fullName: 'Productor',
      email: request.user.email,
      role: AccountRole.PRODUCER,
    };
    userService.getUserById.mockResolvedValue(profile);

    await expect(controller.getProfile(request)).resolves.toEqual(profile);
    expect(userService.getUserById).toHaveBeenCalledWith(request.user.userId);
  });

  it('keeps the legacy id route restricted to self', async () => {
    userService.getUserById.mockResolvedValue(null);

    await controller.getUserById(request.user.userId, request);

    expect(userService.getUserById).toHaveBeenCalledWith(request.user.userId);
  });

  it('does not expose another user through the legacy id route', () => {
    expect(() =>
      controller.getUserById('22222222-2222-4222-8222-222222222222', request),
    ).toThrow(NotFoundException);
  });

  it('updates only the authenticated user', async () => {
    userService.updateUser.mockResolvedValue(null);

    await controller.updateUser(request, { fullName: 'Actualizado' });

    expect(userService.updateUser).toHaveBeenCalledWith(request.user.userId, {
      fullName: 'Actualizado',
    });
  });

  it('deletes only the authenticated user', async () => {
    await controller.deleteUser(request.user.userId, request);

    expect(userService.deleteUser).toHaveBeenCalledWith(request.user.userId);
  });

  it('rejects deletion of another user', () => {
    expect(() =>
      controller.deleteUser('22222222-2222-4222-8222-222222222222', request),
    ).toThrow(NotFoundException);
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });
});
