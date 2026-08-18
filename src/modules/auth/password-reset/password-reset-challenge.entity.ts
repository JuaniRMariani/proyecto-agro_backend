import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('password_reset_challenges')
export class PasswordResetChallenge {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'char', length: 64 })
  emailHash: string;

  @Column({ type: 'char', length: 64 })
  codeHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'integer', default: 5 })
  maxAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'char', length: 64, nullable: true })
  resetTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetTokenExpiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
