import type { MigrationInterface, QueryRunner } from 'typeorm';
import { AddAccountRolesAndProfessionalAccess1787080000000 } from './1787080000000-AddAccountRolesAndProfessionalAccess';
import { AddProfessionalReviews1787080001000 } from './1787080001000-AddProfessionalReviews';
import { AddBcsScoreProvenance1787080002000 } from './1787080002000-AddBcsScoreProvenance';
import { InitialSchema1768842440975 } from './1768842440975-InitialSchema';

function createQueryRunner(): {
  runner: QueryRunner;
  query: jest.MockedFunction<QueryRunner['query']>;
} {
  const query: jest.MockedFunction<QueryRunner['query']> = jest.fn();
  const runner = { query } as unknown as QueryRunner;
  return { runner, query };
}

async function runMigration(
  migration: MigrationInterface,
  direction: 'up' | 'down',
): Promise<string[]> {
  const { runner, query } = createQueryRunner();
  await migration[direction](runner);
  return query.mock.calls.map(([sql]) => String(sql));
}

describe('professional feature migrations', () => {
  it('bootstraps UUID support and the user table before dependent tables', async () => {
    const migration = new InitialSchema1768842440975();

    const up = await runMigration(migration, 'up');
    const down = await runMigration(migration, 'down');

    expect(up[0]).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    expect(up[1]).toContain('CREATE TABLE "user"');
    expect(up[1]).toContain('UNIQUE ("email")');
    expect(down.at(-1)).toBe('DROP TABLE "user"');
  });

  it('adds and removes account roles and professional access', async () => {
    const migration = new AddAccountRolesAndProfessionalAccess1787080000000();

    const up = await runMigration(migration, 'up');
    const down = await runMigration(migration, 'down');

    expect(up.join('\n')).toContain('CREATE TABLE "professional_access"');
    expect(up.join('\n')).toContain('ALTER TABLE "user" ADD "role"');
    expect(down.join('\n')).toContain('DROP TABLE "professional_access"');
    expect(down.join('\n')).toContain('ALTER TABLE "user" DROP COLUMN "role"');
  });

  it('adds and removes professional reviews', async () => {
    const migration = new AddProfessionalReviews1787080001000();

    const up = await runMigration(migration, 'up');
    const down = await runMigration(migration, 'down');

    expect(up.join('\n')).toContain('CREATE TABLE "professional_reviews"');
    expect(up.join('\n')).toContain('"suggestedScore"');
    expect(down.join('\n')).toContain('DROP TABLE "professional_reviews"');
  });

  it('backfills immutable model score and reverses provenance columns', async () => {
    const migration = new AddBcsScoreProvenance1787080002000();

    const up = await runMigration(migration, 'up');
    const down = await runMigration(migration, 'down');

    expect(up.join('\n')).toContain(
      'UPDATE "body_condition_scores" SET "modelScore" = "score"',
    );
    expect(up.join('\n')).toContain('"appliedReviewId"');
    expect(down.join('\n')).toContain('DROP COLUMN "modelScore"');
    expect(down.join('\n')).toContain(
      'DROP TYPE "body_condition_score_source_enum"',
    );
  });
});
