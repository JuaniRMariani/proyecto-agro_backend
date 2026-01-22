import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { IUserRepository } from './infra/user.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      changePassword: jest.fn(),
      saveVerificationCode: jest.fn(),
      clearVerificationCode: jest.fn(),
      findByVerificationCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'IUserRepository', useValue: userRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user with hashed password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    userRepository.create.mockResolvedValue({
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
    } as any);

    const result = await service.createUser({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'plain',
      passwordConfirmation: 'plain',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
      passwordConfirmation: 'plain',
    });
    expect(result).toEqual({
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@example.com',
    });
  });

  it('throws ConflictException on duplicate email', async () => {
    userRepository.create.mockRejectedValue({ code: '23505' });
    await expect(
      service.createUser({
        fullName: 'Dup User',
        email: 'dup@example.com',
        password: 'plain',
        passwordConfirmation: 'plain',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws InternalServerErrorException on unexpected error', async () => {
    userRepository.create.mockRejectedValue(new Error('boom'));
    await expect(
      service.createUser({
        fullName: 'User',
        email: 'user@example.com',
        password: 'plain',
        passwordConfirmation: 'plain',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('hashes password on update', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    userRepository.update.mockResolvedValue({
      id: 'user-1',
      fullName: 'Updated User',
      email: 'test@example.com',
    } as any);

    await service.updateUser('user-1', { password: 'newpass' });

    expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      password: 'hashed',
    });
  });

  it('throws when getUserByEmail returns null', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(service.getUserByEmail('missing@example.com')).rejects.toThrow(
      'Usuario no encontrado',
    );
  });

  it('changes password with hashing', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    await service.changePassword('user-1', 'newpass');
    expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    expect(userRepository.changePassword).toHaveBeenCalledWith('user-1', 'hashed');
  });

  it('returns mapped users from getAllUsers', async () => {
    userRepository.findAll.mockResolvedValue([
      { id: 'user-1', fullName: 'Test', email: 't@example.com' },
      { id: 'user-2', fullName: 'Test2', email: 't2@example.com' },
    ] as any);

    const result = await service.getAllUsers();

    expect(result).toEqual([
      { id: 'user-1', fullName: 'Test', email: 't@example.com' },
      { id: 'user-2', fullName: 'Test2', email: 't2@example.com' },
    ]);
  });

  it('returns null when getUserById does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(service.getUserById('missing')).resolves.toBeNull();
  });

  it('deletes user', async () => {
    await service.deleteUser('user-1');
    expect(userRepository.delete).toHaveBeenCalledWith('user-1');
  });

  it('throws when getUserByEmailWithPassword returns null', async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(null);
    await expect(
      service.getUserByEmailWithPassword('missing@example.com'),
    ).rejects.toThrow('Las credenciales ingresadas son incorrectas');
  });
});
