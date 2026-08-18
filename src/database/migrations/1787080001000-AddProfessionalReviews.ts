import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfessionalReviews1787080001000 implements MigrationInterface {
  name = 'AddProfessionalReviews1787080001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "professional_review_status_enum" AS ENUM ('draft', 'published')`,
    );
    await queryRunner.query(
      `CREATE TABLE "professional_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "producerId" uuid NOT NULL,
        "cowId" uuid NOT NULL,
        "scoreId" uuid NOT NULL,
        "authorProfessionalId" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "assessment" text NOT NULL,
        "recommendations" text NOT NULL,
        "suggestedScore" character varying(10),
        "referenceLinks" text array NOT NULL DEFAULT '{}',
        "exampleImageUrls" text array NOT NULL DEFAULT '{}',
        "status" "professional_review_status_enum" NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_professional_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "FK_professional_reviews_producer" FOREIGN KEY ("producerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_professional_reviews_cow" FOREIGN KEY ("cowId") REFERENCES "cows"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_professional_reviews_score" FOREIGN KEY ("scoreId") REFERENCES "body_condition_scores"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_professional_reviews_author" FOREIGN KEY ("authorProfessionalId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_reviews_producer_status" ON "professional_reviews" ("producerId", "status", "updatedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_reviews_author" ON "professional_reviews" ("authorProfessionalId", "updatedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_reviews_score" ON "professional_reviews" ("scoreId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_professional_reviews_score"`);
    await queryRunner.query(`DROP INDEX "IDX_professional_reviews_author"`);
    await queryRunner.query(
      `DROP INDEX "IDX_professional_reviews_producer_status"`,
    );
    await queryRunner.query(`DROP TABLE "professional_reviews"`);
    await queryRunner.query(`DROP TYPE "professional_review_status_enum"`);
  }
}
