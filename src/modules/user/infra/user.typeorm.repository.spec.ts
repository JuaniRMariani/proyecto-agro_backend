import type { Repository } from 'typeorm';
import { User } from '../user.entity';
import { UserTypeOrmRepository } from './user.typeorm.repository';

describe('UserTypeOrmRepository', () => {
  it('clears password reset state with explicit SQL null values', async () => {
    const update = jest.fn().mockResolvedValue({ affected: 1 });
    const typeOrmRepository = {
      update,
    } as unknown as Repository<User>;
    const repository = new UserTypeOrmRepository(typeOrmRepository);

    await repository.clearVerificationCode(
      '11111111-1111-4111-8111-111111111111',
    );

    expect(update.mock.calls).toContainEqual([
      '11111111-1111-4111-8111-111111111111',
      { resetPasswordToken: null, resetPasswordExpires: null },
    ]);
  });
});
