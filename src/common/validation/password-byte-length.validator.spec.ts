import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ConfirmPasswordResetDto } from '../../modules/auth/password-reset/dto/confirm-password-reset.dto';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';

describe('bcrypt password byte validation', () => {
  const oversizedPassword = String.fromCodePoint(0x1f404).repeat(19);

  it('rejects a multibyte registration password above 72 UTF-8 bytes', async () => {
    const dto = plainToInstance(CreateUserDto, {
      email: 'user@example.com',
      fullName: 'User',
      password: oversizedPassword,
      passwordConfirmation: oversizedPassword,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects a multibyte reset password above 72 UTF-8 bytes', async () => {
    const dto = plainToInstance(ConfirmPasswordResetDto, {
      requestId: '11111111-1111-4111-8111-111111111111',
      resetToken: 'opaque-token',
      password: oversizedPassword,
      passwordConfirmation: oversizedPassword,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
