import type { EntityManager, Repository } from 'typeorm';
import { AccountRole } from '../account-role.enum';
import { User } from '../user.entity';
import { UserTypeOrmRepository } from './user.typeorm.repository';

describe('UserTypeOrmRepository auth state', () => {
  it('loads tokenVersion used to revoke existing JWTs', async () => {
    const user = Object.assign(new User(), {
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'User',
      email: 'user@example.com',
      role: AccountRole.PRODUCER,
      tokenVersion: 3,
    });
    const findOneBy = jest.fn().mockResolvedValue(user);
    const typeOrmRepository = {
      findOneBy,
    } as unknown as Repository<User>;
    const repository = new UserTypeOrmRepository(typeOrmRepository);

    await expect(repository.findById(user.id)).resolves.toMatchObject({
      tokenVersion: 3,
    });
    expect(findOneBy.mock.calls).toContainEqual([{ id: user.id }]);
  });

  it('rotates tokenVersion atomically when the password changes', async () => {
    const user = Object.assign(new User(), {
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'User',
      email: 'user@example.com',
      password: 'old-hash',
      role: AccountRole.PRODUCER,
      tokenVersion: 2,
    });
    const manager = {
      findOne: jest.fn().mockResolvedValue(user),
      merge: jest
        .fn()
        .mockImplementation(
          (_target: typeof User, entity: User, update: Partial<User>) =>
            Object.assign(entity, update),
        ),
      save: jest
        .fn()
        .mockImplementation((_target: typeof User, entity: User) =>
          Promise.resolve(entity),
        ),
    } as unknown as EntityManager;
    const transaction = jest.fn(
      async <T>(operation: (entityManager: EntityManager) => Promise<T>) =>
        operation(manager),
    );
    const typeOrmRepository = {
      manager: { transaction },
    } as unknown as Repository<User>;
    const repository = new UserTypeOrmRepository(typeOrmRepository);

    await expect(
      repository.update(user.id, { password: 'new-hash' }),
    ).resolves.toMatchObject({ password: 'new-hash', tokenVersion: 3 });
    expect((manager.findOne as jest.Mock).mock.calls[0]).toEqual([
      User,
      {
        where: { id: user.id },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
  });
});
