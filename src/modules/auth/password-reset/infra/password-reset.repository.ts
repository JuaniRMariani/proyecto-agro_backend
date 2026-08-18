import type { PasswordResetChallenge } from '../password-reset-challenge.entity';

export interface CreatePasswordResetChallenge {
  id: string;
  userId: string | null;
  emailHash: string;
  codeHash: string;
  expiresAt: Date;
  maxAttempts: number;
}

export type VerifyPasswordResetResult =
  | { kind: 'verified' }
  | { kind: 'invalid' };

export type PasswordResetChallengeCreation =
  | { kind: 'created'; challenge: PasswordResetChallenge }
  | { kind: 'cooldown'; challenge: PasswordResetChallenge };

export interface IPasswordResetRepository {
  getOrCreateChallenge(
    input: CreatePasswordResetChallenge,
    createdAfter: Date,
  ): Promise<PasswordResetChallengeCreation>;
  verify(input: {
    challengeId: string;
    codeHash: string;
    resetTokenHash: string;
    resetTokenExpiresAt: Date;
    now: Date;
  }): Promise<VerifyPasswordResetResult>;
  consumeAndChangePassword(input: {
    challengeId: string;
    resetTokenHash: string;
    hashPassword: () => Promise<string>;
    now: Date;
  }): Promise<boolean>;
}
