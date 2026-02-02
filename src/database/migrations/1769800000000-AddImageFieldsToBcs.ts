import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageFieldsToBcs1769800000000 implements MigrationInterface {
  name = 'AddImageFieldsToBcs1769800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "imageUrl" character varying NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD "imagePublicId" character varying NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "imagePublicId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP COLUMN "imageUrl"`,
    );
  }
}
