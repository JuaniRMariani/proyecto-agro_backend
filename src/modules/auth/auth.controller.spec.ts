import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { AccountRole } from '../user/account-role.enum';
import { AuthController } from './auth.controller';
import type { AuthResponseDto } from './dto/auth-response.dto';
import { AuthService } from './auth.service';
import { PasswordResetRequestResponseDto } from './password-reset/dto/password-reset-response.dto';
import { PasswordResetVerifyResponseDto } from './password-reset/dto/password-reset-response.dto';
import { PasswordResetService } from './password-reset/password-reset.service';

type AuthServiceMock = jest.Mocked<
  Pick<AuthService, 'login' | 'register' | 'logout'>
>;
type PasswordResetServiceMock = jest.Mocked<
  Pick<PasswordResetService, 'requestReset' | 'verifyReset' | 'confirmReset'>
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
const request: AuthenticatedRequest = {
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
  let passwordResetService: PasswordResetServiceMock;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    };
    passwordResetService = {
      requestReset: jest.fn(),
      verifyReset: jest.fn(),
      confirmReset: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PasswordResetService, useValue: passwordResetService },
      ],
    }).compile();
    controller = module.get(AuthController);
  });

  it('delegates login and registration', async () => {
    authService.login.mockResolvedValue(authResponse);
    authService.register.mockResolvedValue(authResponse);

    await expect(
      controller.login({ email: 't@example.com', password: 'pass' }),
    ).resolves.toEqual(authResponse);
    await expect(
      controller.register({
        fullName: 'Test',
        email: 't@example.com',
        password: 'pass12',
        passwordConfirmation: 'pass12',
      }),
    ).resolves.toEqual(authResponse);
  });

  it('delegates logout with bearer token', async () => {
    await controller.logout(request);
    expect(authService.logout.mock.calls).toContainEqual(['token']);
  });

  it('exposes the three-step password reset contract', async () => {
    const requestId = '22222222-2222-4222-8222-222222222222';
    passwordResetService.requestReset.mockResolvedValue(
      new PasswordResetRequestResponseDto(requestId),
    );
    passwordResetService.verifyReset.mockResolvedValue(
      new PasswordResetVerifyResponseDto('reset-token'),
    );

    await expect(
      controller.requestPasswordReset({ email: 't@example.com' }),
    ).resolves.toEqual({ requestId });
    await expect(
      controller.verifyPasswordReset({ requestId, code: '123456' }),
    ).resolves.toEqual({ resetToken: 'reset-token' });
    await controller.confirmPasswordReset({
      requestId,
      resetToken: 'reset-token',
      password: 'newpass',
      passwordConfirmation: 'newpass',
    });
    expect(passwordResetService.confirmReset.mock.calls).toHaveLength(1);
  });
});
