import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompleteDatabaseSchema1709700000000 implements MigrationInterface {
  name = 'AddCompleteDatabaseSchema1709700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create daily_call_stats table
    await queryRunner.query(`
      CREATE TABLE "daily_call_stats" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pbx_id" character varying NOT NULL,
        "date" date NOT NULL,
        "total_calls" integer NOT NULL DEFAULT 0,
        "answered_calls" integer NOT NULL DEFAULT 0,
        "failed_calls" integer NOT NULL DEFAULT 0,
        "unanswered_calls" integer NOT NULL DEFAULT 0,
        "rejected_calls" integer NOT NULL DEFAULT 0,
        "total_duration_seconds" integer NOT NULL DEFAULT 0,
        "avg_duration_seconds" numeric(10,2) DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_daily_call_stats" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_daily_call_stats_pbx_date" UNIQUE ("pbx_id", "date")
      )
    `);

    // Create trunk_status_history table
    await queryRunner.query(`
      CREATE TABLE "trunk_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pbx_id" character varying NOT NULL,
        "trunk_id" character varying NOT NULL,
        "trunk_name" character varying,
        "status" integer NOT NULL,
        "status_text" character varying,
        "changed_at" TIMESTAMPTZ NOT NULL,
        "duration_seconds" integer,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trunk_status_history" PRIMARY KEY ("id")
      )
    `);

    // Create extension_status_history table
    await queryRunner.query(`
      CREATE TABLE "extension_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pbx_id" character varying NOT NULL,
        "ext_id" character varying NOT NULL,
        "ext_name" character varying,
        "status" integer NOT NULL,
        "status_text" character varying,
        "changed_at" TIMESTAMPTZ NOT NULL,
        "duration_seconds" integer,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_extension_status_history" PRIMARY KEY ("id")
      )
    `);

    // Create network_status_history table
    await queryRunner.query(`
      CREATE TABLE "network_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "host" character varying NOT NULL,
        "status" character varying NOT NULL,
        "changed_at" TIMESTAMPTZ NOT NULL,
        "duration_seconds" integer,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_network_status_history" PRIMARY KEY ("id")
      )
    `);

    // Create monitored_devices table
    await queryRunner.query(`
      CREATE TABLE "monitored_devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_name" character varying NOT NULL,
        "device_type" character varying NOT NULL,
        "ip_address" character varying NOT NULL,
        "snmp_community" character varying DEFAULT 'public',
        "snmp_port" integer DEFAULT 161,
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_monitored_devices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_monitored_devices_ip_address" UNIQUE ("ip_address")
      )
    `);

    // Create device_latency_metrics table
    await queryRunner.query(`
      CREATE TABLE "device_latency_metrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "source_device" character varying NOT NULL,
        "target_device" character varying NOT NULL,
        "latency_ms" numeric(10,2),
        "is_reachable" boolean NOT NULL DEFAULT false,
        "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_latency_metrics" PRIMARY KEY ("id")
      )
    `);

    // Create device_bandwidth_metrics table
    await queryRunner.query(`
      CREATE TABLE "device_bandwidth_metrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_ip" character varying NOT NULL,
        "interface_name" character varying NOT NULL,
        "bytes_in" bigint DEFAULT 0,
        "bytes_out" bigint DEFAULT 0,
        "bandwidth_in_mbps" numeric(10,2),
        "bandwidth_out_mbps" numeric(10,2),
        "utilization_percent" numeric(5,2),
        "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_bandwidth_metrics" PRIMARY KEY ("id")
      )
    `);

    // Create alert_rules table
    await queryRunner.query(`
      CREATE TABLE "alert_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rule_name" character varying NOT NULL,
        "resource_type" character varying NOT NULL,
        "condition_type" character varying NOT NULL,
        "threshold_value" numeric(10,2) NOT NULL,
        "threshold_operator" character varying NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "notify_email" boolean NOT NULL DEFAULT true,
        "notify_sms" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_alert_rules" PRIMARY KEY ("id")
      )
    `);

    // Create event table
    await queryRunner.query(`
      CREATE TABLE "event" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pbx_id" character varying,
        "event_type" character varying NOT NULL,
        "related_entity_type" character varying NOT NULL,
        "related_entity_id" uuid,
        "description" text NOT NULL,
        "severity" character varying NOT NULL,
        "triggered_by" character varying,
        "alert_config_id" uuid,
        "event_data" jsonb,
        "timestamp" TIMESTAMPTZ NOT NULL,
        "resolved" boolean NOT NULL DEFAULT false,
        "resolved_at" TIMESTAMPTZ,
        "resolved_by" character varying,
        "resolution_notes" text,
        "notification_sent" boolean NOT NULL DEFAULT false,
        "correlation_id" character varying,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_daily_call_stats_pbx_id_date" ON "daily_call_stats" ("pbx_id", "date")`);
    await queryRunner.query(`CREATE INDEX "IDX_trunk_status_history_pbx_id_timestamp" ON "trunk_status_history" ("pbx_id", "changed_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_trunk_status_history_trunk_id" ON "trunk_status_history" ("trunk_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_extension_status_history_pbx_id_timestamp" ON "extension_status_history" ("pbx_id", "changed_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_extension_status_history_ext_id" ON "extension_status_history" ("ext_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_network_status_history_host_timestamp" ON "network_status_history" ("host", "changed_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_device_latency_metrics_source_target_timestamp" ON "device_latency_metrics" ("source_device", "target_device", "timestamp")`);
    await queryRunner.query(`CREATE INDEX "IDX_device_bandwidth_metrics_device_ip_timestamp" ON "device_bandwidth_metrics" ("device_ip", "timestamp")`);
    await queryRunner.query(`CREATE INDEX "IDX_alert_rules_resource_type" ON "alert_rules" ("resource_type")`);

    // Create views
    await queryRunner.query(`CREATE VIEW v_latest_trunk_status AS SELECT DISTINCT ON (pbx_id, trunk_id) * FROM trunk_status_history ORDER BY pbx_id, trunk_id, changed_at DESC`);

    await queryRunner.query(`CREATE VIEW v_latest_extension_status AS SELECT DISTINCT ON (pbx_id, ext_id) * FROM extension_status_history ORDER BY pbx_id, ext_id, changed_at DESC`);

    await queryRunner.query(`CREATE VIEW v_latest_network_status AS SELECT DISTINCT ON (host) * FROM network_status_history ORDER BY host, changed_at DESC`);

    await queryRunner.query(`CREATE VIEW v_today_call_stats AS SELECT * FROM daily_call_stats WHERE date = CURRENT_DATE`);

    await queryRunner.query(`CREATE VIEW v_trunk_uptime_24h AS SELECT pbx_id, trunk_id, trunk_name, ROUND((SUM(CASE WHEN status = 1 THEN duration_seconds ELSE 0 END) * 100.0) / NULLIF(SUM(duration_seconds), 0), 2) as uptime_percentage, COUNT(*) as status_changes FROM trunk_status_history WHERE changed_at >= NOW() - INTERVAL '24 hours' GROUP BY pbx_id, trunk_id, trunk_name`);

    await queryRunner.query(`CREATE VIEW v_latest_device_latency AS SELECT DISTINCT ON (source_device, target_device) * FROM device_latency_metrics ORDER BY source_device, target_device, timestamp DESC`);

    await queryRunner.query(`CREATE VIEW v_latest_device_bandwidth AS SELECT DISTINCT ON (device_ip, interface_name) * FROM device_bandwidth_metrics ORDER BY device_ip, interface_name, timestamp DESC`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop views
    await queryRunner.query(`DROP VIEW IF EXISTS v_latest_device_bandwidth`);
    await queryRunner.query(`DROP VIEW IF EXISTS v_latest_device_latency`);
    await queryRunner.query(`DROP VIEW IF EXISTS v_trunk_uptime_24h`);
    await queryRunner.query(`DROP VIEW IF EXISTS v_today_call_stats`);
    await queryRunner.query(`DROP VIEW IF EXISTS v_latest_network_status`);
    await queryRunner.query(`DROP VIEW IF EXISTS v_latest_extension_status`);
    await queryRunner.query(`DROP VIEW IF EXISTS v_latest_trunk_status`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_alert_rules_resource_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_device_bandwidth_metrics_device_ip_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_device_latency_metrics_source_target_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_network_status_history_host_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_extension_status_history_ext_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_extension_status_history_pbx_id_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_trunk_status_history_trunk_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_trunk_status_history_pbx_id_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_call_stats_pbx_id_date"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "alert_rules"`);
    await queryRunner.query(`DROP TABLE "device_bandwidth_metrics"`);
    await queryRunner.query(`DROP TABLE "device_latency_metrics"`);
    await queryRunner.query(`DROP TABLE "monitored_devices"`);
    await queryRunner.query(`DROP TABLE "network_status_history"`);
    await queryRunner.query(`DROP TABLE "extension_status_history"`);
    await queryRunner.query(`DROP TABLE "trunk_status_history"`);
    await queryRunner.query(`DROP TABLE "daily_call_stats"`);
  }
}