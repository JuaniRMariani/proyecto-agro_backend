import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { AccountRole } from '../user/account-role.enum';
import { AuthController } from './auth.controller';
import type { AuthResponseDto } from './dto/auth-response.dto';
import { AuthService } from './auth.service';

type AuthServiceMock = jest.Mocked<
  Pick<
    AuthService,
    | 'login'
    | 'register'
    | 'logout'
    | 'sendCode'
    | 'verifyCode'
    | 'resetPassword'
  >
>;

const authResponse: AuthResponseDto = {
  accessToken: 'token',
  user: {
    id: '11111111-1111-4111-8111-111111111111',
    fullName: 'Test',
    email: 't@example.com',
    role: AccountRole.PRODUCER,
  },
};

const authenticatedRequest: AuthenticatedRequest = {
  headers: { authorization: 'Bearer token' },
  user: {
    userId: authResponse.user.id,
    email: authResponse.user.email,
    role: AccountRole.PRODUCER,
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthServiceMock;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      sendCode: jest.fn(),
      verifyCode: jest.fn(),
      resetPassword: jest.fn(),
    };

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
    authService.login.mockResolvedValue(authResponse);

    await expect(
      controller.login({ email: 't@example.com', password: 'pass' }),
    ).resolves.toEqual(authResponse);
  });

  it('registers user', async () => {
    authService.register.mockResolvedValue(authResponse);

    await expect(
      controller.register({
        fullName: 'Test',
        email: 't@example.com',
        password: 'pass',
        passwordConfirmation: 'pass',
      }),
    ).resolves.toEqual(authResponse);
  });

  it('logs out user', async () => {
    await controller.logout(authenticatedRequest);
    expect(authService.logout.mock.calls).toContainEqual(['token']);
  });

  it('sends code', async () => {
    await controller.sendCode({ email: 't@example.com' });
    expect(authService.sendCode.mock.calls).toContainEqual(['t@example.com']);
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
    });
    expect(authService.resetPassword.mock.calls).toContainEqual([
      '123456',
      'pass',
      'pass',
    ]);
  });
});
