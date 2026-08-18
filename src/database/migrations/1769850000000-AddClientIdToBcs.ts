import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientIdToBcs1769850000000 implements MigrationInterface {
  name = 'AddClientIdToBcs1769850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "clientId" character varying NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_body_condition_scores_clientId" ON "body_condition_scores" ("clientId") WHERE "clientId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_body_condition_scores_clientId"`);
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "clientId"`,
    );
  }
}
