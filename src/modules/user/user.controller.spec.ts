import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    userService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByEmailWithPassword: jest.fn(),
      saveVerificationCode: jest.fn(),
      clearVerificationCode: jest.fn(),
      findByVerificationCode: jest.fn(),
      changePassword: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns users', async () => {
    userService.getAllUsers.mockResolvedValue([
      { id: 'user-1', fullName: 'Test', email: 't@example.com' },
    ]);
    await expect(controller.getUsers()).resolves.toEqual([
      { id: 'user-1', fullName: 'Test', email: 't@example.com' },
    ]);
  });

  it('creates user', async () => {
    userService.createUser.mockResolvedValue({
      id: 'user-1',
      fullName: 'Test',
      email: 't@example.com',
    });
    await expect(
      controller.createUser({
        fullName: 'Test',
        email: 't@example.com',
        password: 'pass',
        passwordConfirmation: 'pass',
      } as any),
    ).resolves.toEqual({
      id: 'user-1',
      fullName: 'Test',
      email: 't@example.com',
    });
  });

  it('gets user by id from request', async () => {
    userService.getUserById.mockResolvedValue({
      id: 'user-1',
      fullName: 'Test',
      email: 't@example.com',
    });

    await expect(
      controller.getUserById({ user: { userId: 'user-1' } } as any),
    ).resolves.toEqual({
      id: 'user-1',
      fullName: 'Test',
      email: 't@example.com',
    });
  });

  it('updates user', async () => {
    userService.updateUser.mockResolvedValue({
      id: 'user-1',
      fullName: 'Updated',
      email: 't@example.com',
    });

    await expect(
      controller.updateUser(
        { user: { userId: 'user-1' } } as any,
        { fullName: 'Updated' } as any,
      ),
    ).resolves.toEqual({
      id: 'user-1',
      fullName: 'Updated',
      email: 't@example.com',
    });
  });

  it('deletes user', async () => {
    await controller.deleteUser('user-1');
    expect(userService.deleteUser).toHaveBeenCalledWith('user-1');
  });
});
