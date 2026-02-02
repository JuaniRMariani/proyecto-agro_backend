import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1768842440975 implements MigrationInterface {
  name = 'InitialSchema1768842440975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "body_condition_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" numeric(3,1) NOT NULL, "recordedAt" TIMESTAMP NOT NULL, "observation" text, "cowId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_591a6ec002fd6c10f0b90b5964b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cow_ownership_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cowId" uuid NOT NULL, "previousUserId" uuid, "newUserId" uuid NOT NULL, "reason" text, "transferredAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_11e95cec678601f069738d0b902" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tagNumber" character varying NOT NULL, "weight" numeric(10,2) NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ca4378ed5ff1d9fa27b9b97c77a" UNIQUE ("tagNumber"), CONSTRAINT "PK_bfabdf11ef43f138c610f584bed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPasswordToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPasswordExpires" TIMESTAMP DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" ADD CONSTRAINT "FK_8bcbb7b7cdff3f9990d5d011cc2" FOREIGN KEY ("cowId") REFERENCES "cows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cow_ownership_history" ADD CONSTRAINT "FK_d6a0b255e19bc4bab1b7c733148" FOREIGN KEY ("cowId") REFERENCES "cows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cow_ownership_history" ADD CONSTRAINT "FK_eb34d05c082f1d5307b56205e09" FOREIGN KEY ("previousUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cow_ownership_history" ADD CONSTRAINT "FK_9bd7a107b6c9a6c48357d8f6d70" FOREIGN KEY ("newUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cows" ADD CONSTRAINT "FK_02f0007075d95d20773e54e5259" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cows" DROP CONSTRAINT "FK_02f0007075d95d20773e54e5259"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cow_ownership_history" DROP CONSTRAINT "FK_9bd7a107b6c9a6c48357d8f6d70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cow_ownership_history" DROP CONSTRAINT "FK_eb34d05c082f1d5307b56205e09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cow_ownership_history" DROP CONSTRAINT "FK_d6a0b255e19bc4bab1b7c733148"`,
    );
    await queryRunner.query(
      `ALTER TABLE "body_condition_scores" DROP CONSTRAINT "FK_8bcbb7b7cdff3f9990d5d011cc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "resetPasswordExpires"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`,
    );
    await queryRunner.query(`DROP TABLE "cows"`);
    await queryRunner.query(`DROP TABLE "cow_ownership_history"`);
    await queryRunner.query(`DROP TABLE "body_condition_scores"`);
  }
}
