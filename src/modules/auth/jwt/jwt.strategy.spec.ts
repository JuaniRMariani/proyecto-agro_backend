import { ConfigService } from '@nestjs/config';
import { AccountRole } from '../../user/account-role.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const strategy = new JwtStrategy(
    new ConfigService({ JWT_SECRET: 'test-secret' }),
  );

  it('maps the account role into the authenticated actor', () => {
    expect(
      strategy.validate({
        sub: 'user-1',
        email: 'vet@example.com',
        role: AccountRole.VETERINARIAN,
      }),
    ).toEqual({
      userId: 'user-1',
      email: 'vet@example.com',
      role: AccountRole.VETERINARIAN,
    });
  });

  it('keeps legacy producer tokens compatible', () => {
    expect(
      strategy.validate({ sub: 'user-1', username: 'old@example.com' }),
    ).toEqual({
      userId: 'user-1',
      email: 'old@example.com',
      role: AccountRole.PRODUCER,
    });
  });
});
