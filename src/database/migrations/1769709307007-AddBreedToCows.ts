import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBreedToCows1769709307007 implements MigrationInterface {
    name = 'AddBreedToCows1769709307007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cows" ADD "breed" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cows" DROP COLUMN "breed"`);
    }

}
