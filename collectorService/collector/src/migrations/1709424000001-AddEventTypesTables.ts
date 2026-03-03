import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddEventTypesTables1709424000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'extension_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'pbx_id', type: 'varchar' },
          { name: 'pbx_sn', type: 'varchar', isNullable: true },
          { name: 'event_type', type: 'varchar' },
          { name: 'ext_id', type: 'varchar', isNullable: true },
          { name: 'ext_name', type: 'varchar', isNullable: true },
          { name: 'registration_status', type: 'int', isNullable: true },
          { name: 'call_status', type: 'int', isNullable: true },
          { name: 'call_id', type: 'varchar', isNullable: true },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'raw', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'agent_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'pbx_id', type: 'varchar' },
          { name: 'pbx_sn', type: 'varchar', isNullable: true },
          { name: 'event_type', type: 'varchar' },
          { name: 'agent_id', type: 'varchar', isNullable: true },
          { name: 'agent_name', type: 'varchar', isNullable: true },
          { name: 'agent_status', type: 'int', isNullable: true },
          { name: 'queue_id', type: 'varchar', isNullable: true },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'raw', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'call_transfer_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'pbx_id', type: 'varchar' },
          { name: 'pbx_sn', type: 'varchar', isNullable: true },
          { name: 'call_id', type: 'varchar' },
          { name: 'from_party', type: 'varchar', isNullable: true },
          { name: 'to_party', type: 'varchar', isNullable: true },
          { name: 'transferrer', type: 'varchar', isNullable: true },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'raw', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_transfer_events');
    await queryRunner.dropTable('agent_events');
    await queryRunner.dropTable('extension_events');
  }
}
