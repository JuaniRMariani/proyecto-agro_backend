import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeScoreToStringAndAddLocation1770752586851 implements MigrationInterface {
    name = 'ChangeScoreToStringAndAddLocation1770752586851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_body_condition_scores_clientId"`);
        await queryRunner.query(`ALTER TABLE "cows" ADD "location" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "body_condition_scores" ALTER COLUMN "score" TYPE character varying(10) USING "score"::text`);
        await queryRunner.query(`ALTER TABLE "body_condition_scores" ADD CONSTRAINT "UQ_07d9307cd59d43eba9c01662d73" UNIQUE ("clientId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "body_condition_scores" DROP CONSTRAINT "UQ_07d9307cd59d43eba9c01662d73"`);
        await queryRunner.query(`ALTER TABLE "body_condition_scores" ALTER COLUMN "score" TYPE numeric(3,1) USING "score"::numeric`);
        await queryRunner.query(`ALTER TABLE "cows" DROP COLUMN "location"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_body_condition_scores_clientId" ON "body_condition_scores" ("clientId") WHERE ("clientId" IS NOT NULL)`);
    }

}
