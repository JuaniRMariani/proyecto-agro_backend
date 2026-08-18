import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountRolesAndProfessionalAccess1787080000000 implements MigrationInterface {
  name = 'AddAccountRolesAndProfessionalAccess1787080000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_account_role_enum" AS ENUM ('producer', 'veterinarian', 'professional')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "user_account_role_enum" NOT NULL DEFAULT 'producer'`,
    );
    await queryRunner.query(
      `CREATE TYPE "professional_access_status_enum" AS ENUM ('pending', 'active', 'rejected', 'revoked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "professional_access" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "producerId" uuid NOT NULL,
        "professionalId" uuid NOT NULL,
        "status" "professional_access_status_enum" NOT NULL DEFAULT 'pending',
        "respondedAt" TIMESTAMP WITH TIME ZONE,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_professional_access_pair" UNIQUE ("producerId", "professionalId"),
        CONSTRAINT "PK_professional_access" PRIMARY KEY ("id"),
        CONSTRAINT "FK_professional_access_producer" FOREIGN KEY ("producerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_professional_access_professional" FOREIGN KEY ("professionalId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_access_producer_status" ON "professional_access" ("producerId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_professional_access_professional_status" ON "professional_access" ("professionalId", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_professional_access_professional_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_professional_access_producer_status"`,
    );
    await queryRunner.query(`DROP TABLE "professional_access"`);
    await queryRunner.query(`DROP TYPE "professional_access_status_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "user_account_role_enum"`);
  }
}
