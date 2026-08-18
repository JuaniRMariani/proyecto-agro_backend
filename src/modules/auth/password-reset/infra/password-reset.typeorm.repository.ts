import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { DataSource, IsNull, MoreThan } from 'typeorm';
import { User } from '../../../user/user.entity';
import { PasswordResetChallenge } from '../password-reset-challenge.entity';
import type {
  CreatePasswordResetChallenge,
  IPasswordResetRepository,
  PasswordResetChallengeCreation,
  VerifyPasswordResetResult,
} from './password-reset.repository';

function hashesMatch(storedHash: string, candidateHash: string): boolean {
  const stored = Buffer.from(storedHash, 'hex');
  const candidate = Buffer.from(candidateHash, 'hex');
  return (
    stored.length === candidate.length && timingSafeEqual(stored, candidate)
  );
}

@Injectable()
export class PasswordResetTypeOrmRepository implements IPasswordResetRepository {
  constructor(private readonly dataSource: DataSource) {}

  getOrCreateChallenge(
    input: CreatePasswordResetChallenge,
    createdAfter: Date,
  ): Promise<PasswordResetChallengeCreation> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [input.emailHash],
      );
      const activeChallenge = await manager.findOne(PasswordResetChallenge, {
        where: {
          emailHash: input.emailHash,
          consumedAt: IsNull(),
          expiresAt: MoreThan(new Date()),
          createdAt: MoreThan(createdAfter),
        },
        order: { createdAt: 'DESC' },
      });
      if (activeChallenge) {
        return { kind: 'cooldown', challenge: activeChallenge };
      }

      await manager.update(
        PasswordResetChallenge,
        { emailHash: input.emailHash, consumedAt: IsNull() },
        { consumedAt: new Date() },
      );
      const challenge = await manager.save(
        PasswordResetChallenge,
        manager.create(PasswordResetChallenge, {
          ...input,
          attempts: 0,
          verifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          consumedAt: null,
        }),
      );
      return { kind: 'created', challenge };
    });
  }

  verify(input: {
    challengeId: string;
    codeHash: string;
    resetTokenHash: string;
    resetTokenExpiresAt: Date;
    now: Date;
  }): Promise<VerifyPasswordResetResult> {
    return this.dataSource.transaction(async (manager) => {
      const challenge = await manager.findOne(PasswordResetChallenge, {
        where: { id: input.challengeId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !challenge ||
        challenge.consumedAt ||
        challenge.verifiedAt ||
        challenge.expiresAt <= input.now ||
        challenge.attempts >= challenge.maxAttempts
      ) {
        return { kind: 'invalid' };
      }

      if (
        !challenge.userId ||
        !hashesMatch(challenge.codeHash, input.codeHash)
      ) {
        challenge.attempts += 1;
        await manager.save(challenge);
        return { kind: 'invalid' };
      }

      challenge.verifiedAt = input.now;
      challenge.resetTokenHash = input.resetTokenHash;
      challenge.resetTokenExpiresAt = input.resetTokenExpiresAt;
      await manager.save(challenge);
      return { kind: 'verified' };
    });
  }

  consumeAndChangePassword(input: {
    challengeId: string;
    resetTokenHash: string;
    hashPassword: () => Promise<string>;
    now: Date;
  }): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const challenge = await manager.findOne(PasswordResetChallenge, {
        where: { id: input.challengeId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !challenge?.userId ||
        challenge.consumedAt ||
        !challenge.verifiedAt ||
        !challenge.resetTokenHash ||
        !challenge.resetTokenExpiresAt ||
        challenge.resetTokenExpiresAt <= input.now ||
        !hashesMatch(challenge.resetTokenHash, input.resetTokenHash)
      ) {
        return false;
      }

      const passwordHash = await input.hashPassword();
      await manager.update(User, challenge.userId, { password: passwordHash });
      await manager.increment(
        User,
        { id: challenge.userId },
        'tokenVersion',
        1,
      );
      challenge.consumedAt = input.now;
      challenge.resetTokenHash = null;
      challenge.resetTokenExpiresAt = null;
      await manager.save(challenge);
      return true;
    });
  }
}
