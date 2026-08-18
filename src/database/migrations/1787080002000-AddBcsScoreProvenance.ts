import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBcsScoreProvenance1787080002000 implements MigrationInterface {
  name = 'AddBcsScoreProvenance1787080002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "body_condition_score_source_enum" AS ENUM ('model', 'producer_override', 'professional_recommendation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "modelScore" character varying(10)`,
    );
    await queryRunner.query(
      `UPDATE "body_condition_scores" SET "modelScore" = "score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ALTER COLUMN "modelScore" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "scoreSource" "body_condition_score_source_enum" NOT NULL DEFAULT 'model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "overrideReason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "overriddenAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "overriddenByUserId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "appliedReviewId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD CONSTRAINT "FK_bcs_overridden_by_user" FOREIGN KEY ("overriddenByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD CONSTRAINT "FK_bcs_applied_review" FOREIGN KEY ("appliedReviewId") REFERENCES "professional_reviews"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcs_applied_review" ON "body_condition_scores" ("appliedReviewId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_bcs_applied_review"`);
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP CONSTRAINT "FK_bcs_applied_review"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP CONSTRAINT "FK_bcs_overridden_by_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "appliedReviewId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "overriddenByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "overriddenAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "overrideReason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "scoreSource"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "modelScore"`,
    );
    await queryRunner.query(`DROP TYPE "body_condition_score_source_enum"`);
  }
}
