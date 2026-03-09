import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitSchema1709424000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'pbx_id', type: 'varchar' },
          { name: 'pbx_sn', type: 'varchar', isNullable: true },
          { name: 'event_type', type: 'varchar' },
          { name: 'event_id', type: 'varchar', isNullable: true },
          { name: 'resource_type', type: 'varchar' },
          { name: 'resource_id', type: 'varchar', isNullable: true },
          { name: 'resource_name', type: 'varchar', isNullable: true },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'raw', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'state_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'pbx_id', type: 'varchar' },
          { name: 'resource_type', type: 'varchar' },
          { name: 'resource_id', type: 'varchar', isNullable: true },
          { name: 'previous_state', type: 'jsonb', isNullable: true },
          { name: 'current_state', type: 'jsonb', isNullable: true },
          { name: 'changed_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('state_history');
    await queryRunner.dropTable('events');
  }
}
