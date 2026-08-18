import { createHash } from 'crypto';
import type { DataSource, EntityManager } from 'typeorm';
import { PasswordResetChallenge } from '../password-reset-challenge.entity';
import { PasswordResetTypeOrmRepository } from './password-reset.typeorm.repository';

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function makeChallenge(): PasswordResetChallenge {
  return Object.assign(new PasswordResetChallenge(), {
    id: '11111111-1111-4111-8111-111111111111',
    userId: '22222222-2222-4222-8222-222222222222',
    emailHash: digest('email'),
    codeHash: digest('code'),
    expiresAt: new Date(Date.now() + 600_000),
    attempts: 0,
    maxAttempts: 5,
    verifiedAt: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    consumedAt: null,
    createdAt: new Date(),
  });
}

describe('PasswordResetTypeOrmRepository atomic transitions', () => {
  let challenge: PasswordResetChallenge;
  let manager: EntityManager;
  let update: jest.Mock;
  let increment: jest.Mock;
  let repository: PasswordResetTypeOrmRepository;

  beforeEach(() => {
    challenge = makeChallenge();
    update = jest.fn();
    increment = jest.fn();
    manager = {
      findOne: jest.fn().mockImplementation(() => Promise.resolve(challenge)),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      update,
      increment,
    } as unknown as EntityManager;
    const transaction = jest.fn(
      async <T>(operation: (entityManager: EntityManager) => Promise<T>) =>
        operation(manager),
    );
    const dataSource = { transaction } as unknown as DataSource;
    repository = new PasswordResetTypeOrmRepository(dataSource);
  });

  it('serializes concurrent requests by email hash into one challenge', async () => {
    let activeChallenge: PasswordResetChallenge | null = null;
    let transactionQueue = Promise.resolve();
    const advisoryLock = jest.fn().mockResolvedValue([]);
    const concurrentManager = {
      query: advisoryLock,
      findOne: jest
        .fn()
        .mockImplementation(() => Promise.resolve(activeChallenge)),
      update: jest.fn(),
      create: jest.fn(
        (
          _target: typeof PasswordResetChallenge,
          input: Partial<PasswordResetChallenge>,
        ) => Object.assign(new PasswordResetChallenge(), input),
      ),
      save: jest
        .fn()
        .mockImplementation(
          (
            _target: typeof PasswordResetChallenge,
            entity: PasswordResetChallenge,
          ) => {
            activeChallenge = entity;
            return Promise.resolve(entity);
          },
        ),
    } as unknown as EntityManager;
    const transaction = async <T>(
      operation: (entityManager: EntityManager) => Promise<T>,
    ): Promise<T> => {
      const previousTransaction = transactionQueue;
      let release = (): void => undefined;
      transactionQueue = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previousTransaction;
      try {
        return await operation(concurrentManager);
      } finally {
        release();
      }
    };
    const concurrentRepository = new PasswordResetTypeOrmRepository({
      transaction,
    } as unknown as DataSource);
    const emailHash = digest('same@example.com');
    const baseInput = {
      userId: null,
      emailHash,
      codeHash: digest('code'),
      expiresAt: new Date(Date.now() + 600_000),
      maxAttempts: 5,
    };

    const results = await Promise.all([
      concurrentRepository.getOrCreateChallenge(
        {
          ...baseInput,
          id: '11111111-1111-4111-8111-111111111111',
        },
        new Date(Date.now() - 60_000),
      ),
      concurrentRepository.getOrCreateChallenge(
        {
          ...baseInput,
          id: '22222222-2222-4222-8222-222222222222',
        },
        new Date(Date.now() - 60_000),
      ),
    ]);

    expect(results.map((result) => result.kind).sort()).toEqual([
      'cooldown',
      'created',
    ]);
    expect(results[0].challenge.id).toBe(results[1].challenge.id);
    expect(advisoryLock.mock.calls).toHaveLength(2);
  });

  it('accepts a code only once, including concurrent verification attempts', async () => {
    const now = new Date();
    const results = await Promise.all([
      repository.verify({
        challengeId: challenge.id,
        codeHash: challenge.codeHash,
        resetTokenHash: digest('token-one'),
        resetTokenExpiresAt: new Date(now.getTime() + 600_000),
        now,
      }),
      repository.verify({
        challengeId: challenge.id,
        codeHash: challenge.codeHash,
        resetTokenHash: digest('token-two'),
        resetTokenExpiresAt: new Date(now.getTime() + 600_000),
        now,
      }),
    ]);

    expect(results.map((result) => result.kind).sort()).toEqual([
      'invalid',
      'verified',
    ]);
    expect(challenge.resetTokenHash).toBe(digest('token-one'));
  });

  it('does not run bcrypt work until a reset token is valid', async () => {
    challenge.verifiedAt = new Date();
    challenge.resetTokenHash = digest('valid-token');
    challenge.resetTokenExpiresAt = new Date(Date.now() + 600_000);
    const hashPassword = jest.fn().mockResolvedValue('password-hash');

    const consumed = await repository.consumeAndChangePassword({
      challengeId: challenge.id,
      resetTokenHash: digest('invalid-token'),
      hashPassword,
      now: new Date(),
    });

    expect(consumed).toBe(false);
    expect(hashPassword.mock.calls).toHaveLength(0);
    expect(update.mock.calls).toHaveLength(0);
  });

  it('locks a challenge after five invalid code attempts', async () => {
    const now = new Date();
    for (let attempt = 0; attempt < challenge.maxAttempts; attempt += 1) {
      await expect(
        repository.verify({
          challengeId: challenge.id,
          codeHash: digest(`wrong-${attempt}`),
          resetTokenHash: digest('token'),
          resetTokenExpiresAt: new Date(now.getTime() + 600_000),
          now,
        }),
      ).resolves.toEqual({ kind: 'invalid' });
    }

    expect(challenge.attempts).toBe(5);
    await expect(
      repository.verify({
        challengeId: challenge.id,
        codeHash: challenge.codeHash,
        resetTokenHash: digest('token'),
        resetTokenExpiresAt: new Date(now.getTime() + 600_000),
        now,
      }),
    ).resolves.toEqual({ kind: 'invalid' });
    expect(challenge.verifiedAt).toBeNull();
  });

  it('changes password and consumes the challenge in one transaction', async () => {
    challenge.verifiedAt = new Date();
    challenge.resetTokenHash = digest('valid-token');
    challenge.resetTokenExpiresAt = new Date(Date.now() + 600_000);
    const hashPassword = jest.fn().mockResolvedValue('password-hash');

    const consumed = await repository.consumeAndChangePassword({
      challengeId: challenge.id,
      resetTokenHash: digest('valid-token'),
      hashPassword,
      now: new Date(),
    });

    expect(consumed).toBe(true);
    expect(hashPassword.mock.calls).toHaveLength(1);
    expect(update.mock.calls).toHaveLength(1);
    expect(increment.mock.calls).toHaveLength(1);
    expect(challenge.consumedAt).toBeInstanceOf(Date);
    expect(challenge.resetTokenHash).toBeNull();

    const secondHashPassword = jest.fn().mockResolvedValue('other-hash');
    await expect(
      repository.consumeAndChangePassword({
        challengeId: challenge.id,
        resetTokenHash: digest('valid-token'),
        hashPassword: secondHashPassword,
        now: new Date(),
      }),
    ).resolves.toBe(false);
    expect(secondHashPassword.mock.calls).toHaveLength(0);
  });
});
