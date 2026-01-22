import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAndSyncAt1769090400000 implements MigrationInterface {
    name = 'AddDeletedAndSyncAt1769090400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cows" ADD "deleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cows" ADD "syncAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "body_condition_scores" ADD "deleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "body_condition_scores" ADD "syncAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "body_condition_scores" DROP COLUMN "syncAt"`);
        await queryRunner.query(`ALTER TABLE "body_condition_scores" DROP COLUMN "deleted"`);
        await queryRunner.query(`ALTER TABLE "cows" DROP COLUMN "syncAt"`);
        await queryRunner.query(`ALTER TABLE "cows" DROP COLUMN "deleted"`);
    }
}
