import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEventRelatedEntityIdType1726470000000 implements MigrationInterface {
  name = 'FixEventRelatedEntityIdType1726470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" ALTER COLUMN "related_entity_id" TYPE character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" ALTER COLUMN "related_entity_id" TYPE uuid USING related_entity_id::uuid`,
    );
  }
}