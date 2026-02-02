import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      sendCode: jest.fn(),
      verifyCode: jest.fn(),
      resetPassword: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('logs in user', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'token',
      user: {},
    } as any);
    await expect(
      controller.login({ email: 't@example.com', password: 'pass' }),
    ).resolves.toEqual({ accessToken: 'token', user: {} });
  });

  it('registers user', async () => {
    authService.register.mockResolvedValue({
      accessToken: 'token',
      user: {},
    } as any);
    await expect(
      controller.register({
        fullName: 'Test',
        email: 't@example.com',
        password: 'pass',
        passwordConfirmation: 'pass',
      } as any),
    ).resolves.toEqual({ accessToken: 'token', user: {} });
  });

  it('logs out user', async () => {
    await controller.logout({
      headers: { authorization: 'Bearer token' },
    } as any);
    expect(authService.logout).toHaveBeenCalledWith('token');
  });

  it('sends code', async () => {
    await controller.sendCode({ email: 't@example.com' });
    expect(authService.sendCode).toHaveBeenCalledWith('t@example.com');
  });

  it('verifies code', async () => {
    authService.verifyCode.mockResolvedValue({ valid: true });
    await expect(controller.verifyCode({ code: '123456' })).resolves.toEqual({
      valid: true,
    });
  });

  it('resets password', async () => {
    await controller.resetPassword({
      code: '123456',
      password: 'pass',
      passwordConfirmation: 'pass',
    } as any);
    expect(authService.resetPassword).toHaveBeenCalledWith(
      '123456',
      'pass',
      'pass',
    );
  });
});
