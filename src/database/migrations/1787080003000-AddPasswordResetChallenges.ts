import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetChallenges1787080003000 implements MigrationInterface {
  name = 'AddPasswordResetChallenges1787080003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "tokenVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset_challenges" ("id" uuid NOT NULL, "userId" uuid, "emailHash" character(64) NOT NULL, "codeHash" character(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT 0, "maxAttempts" integer NOT NULL DEFAULT 5, "verifiedAt" TIMESTAMP WITH TIME ZONE, "resetTokenHash" character(64), "resetTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "consumedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_password_reset_challenges" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_challenges_email_created" ON "password_reset_challenges" ("emailHash", "createdAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_challenges" ADD CONSTRAINT "FK_password_reset_challenges_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "resetPasswordExpires"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPasswordToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPasswordExpires" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_challenges" DROP CONSTRAINT "FK_password_reset_challenges_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_challenges_email_created"`,
    );
    await queryRunner.query(`DROP TABLE "password_reset_challenges"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenVersion"`);
  }
}
