-- Drop old tables (if they exist)
DROP TABLE IF EXISTS daily_call_stats CASCADE;
DROP TABLE IF EXISTS trunk_status_history CASCADE;
DROP TABLE IF EXISTS extension_status_history CASCADE;
DROP TABLE IF EXISTS network_status_history CASCADE;
DROP TABLE IF EXISTS device_latency_metrics CASCADE;
DROP TABLE IF EXISTS device_bandwidth_metrics CASCADE;
DROP TABLE IF EXISTS monitored_devices CASCADE;
DROP TABLE IF EXISTS alert_rules CASCADE;
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS active_calls_snapshot CASCADE;
DROP TABLE IF EXISTS minute_call_stats CASCADE;
DROP TABLE IF EXISTS network_metrics CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Trunk Monitoring
CREATE TABLE trunk_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pbx_id VARCHAR,
  trunk_id VARCHAR NOT NULL,
  trunk_name VARCHAR NOT NULL,
  peer_name VARCHAR,
  source_type VARCHAR NOT NULL,
  destination_type VARCHAR NOT NULL,
  source_ip VARCHAR NOT NULL,
  destination_ip VARCHAR NOT NULL,
  status INTEGER NOT NULL,
  status_text VARCHAR NOT NULL,
  protocol VARCHAR,
  codec VARCHAR,
  current_bandwidth_in NUMERIC(10,2),
  current_bandwidth_out NUMERIC(10,2),
  current_latency_ms NUMERIC(10,2),
  active_calls INTEGER DEFAULT 0,
  ip_reachability BOOLEAN NOT NULL,
  status_changed_at TIMESTAMPTZ NOT NULL,
  uptime_seconds INTEGER,
  downtime_seconds INTEGER,
  last_checked TIMESTAMPTZ NOT NULL,
  mno_info JSONB,
  devices_connected JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trunk_monitoring_pbx_trunk ON trunk_monitoring(pbx_id, trunk_id);
CREATE INDEX idx_trunk_monitoring_status ON trunk_monitoring(status, last_checked);

-- 2. Network Monitoring
CREATE TABLE network_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pbx_id VARCHAR,
  device_name VARCHAR NOT NULL,
  device_type VARCHAR NOT NULL,
  ip_address VARCHAR NOT NULL,
  hostname VARCHAR,
  reachable BOOLEAN NOT NULL,
  latency_ms NUMERIC(10,2),
  packet_loss_percent NUMERIC(5,2),
  jitter_ms NUMERIC(10,2),
  source VARCHAR,
  trunk_id UUID,
  network_path VARCHAR,
  timestamp TIMESTAMPTZ NOT NULL,
  additional_metrics JSONB,
  status_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_network_monitoring_device ON network_monitoring(device_name, timestamp);
CREATE INDEX idx_network_monitoring_ip ON network_monitoring(ip_address, timestamp);
CREATE INDEX idx_network_monitoring_reachable ON network_monitoring(reachable, timestamp);

-- 3. Bandwidth Monitoring
CREATE TABLE bandwidth_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pbx_id VARCHAR,
  trunk_id UUID,
  device_name VARCHAR,
  device_ip VARCHAR,
  interface_name VARCHAR,
  bytes_received BIGINT DEFAULT 0,
  bandwidth_in_mbps NUMERIC(10,2),
  bandwidth_in_percent NUMERIC(5,2),
  bytes_sent BIGINT DEFAULT 0,
  bandwidth_out_mbps NUMERIC(10,2),
  bandwidth_out_percent NUMERIC(5,2),
  max_capacity_mbps NUMERIC(10,2),
  total_utilization_percent NUMERIC(5,2),
  errors_in BIGINT DEFAULT 0,
  errors_out BIGINT DEFAULT 0,
  drops_in BIGINT DEFAULT 0,
  drops_out BIGINT DEFAULT 0,
  measurement_source VARCHAR NOT NULL,
  active_calls_count INTEGER,
  codec_used VARCHAR,
  timestamp TIMESTAMPTZ NOT NULL,
  additional_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bandwidth_monitoring_trunk ON bandwidth_monitoring(trunk_id, timestamp);
CREATE INDEX idx_bandwidth_monitoring_device ON bandwidth_monitoring(device_name, interface_name, timestamp);

-- 4. Call Monitoring
CREATE TABLE call_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pbx_id VARCHAR,
  trunk_id UUID,
  period_start TIMESTAMPTZ NOT NULL,
  period_type VARCHAR NOT NULL,
  active_calls INTEGER DEFAULT 0,
  peak_concurrent_calls INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  inbound_calls INTEGER DEFAULT 0,
  outbound_calls INTEGER DEFAULT 0,
  internal_calls INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  rejected_calls INTEGER DEFAULT 0,
  no_answer_calls INTEGER DEFAULT 0,
  busy_calls INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  avg_duration_seconds NUMERIC(10,2),
  max_duration_seconds INTEGER,
  min_duration_seconds INTEGER,
  avg_call_setup_time_ms NUMERIC(10,2),
  call_success_rate_percent NUMERIC(5,2),
  mno_distribution JSONB,
  last_updated TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trunk_id, period_start, period_type)
);

CREATE INDEX idx_call_monitoring_trunk ON call_monitoring(trunk_id, period_start);
CREATE INDEX idx_call_monitoring_period ON call_monitoring(period_type, period_start);

-- 5. System Configuration
CREATE TABLE system_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  threshold_min NUMERIC(10,2),
  threshold_max NUMERIC(10,2),
  unit VARCHAR,
  severity VARCHAR,
  enabled BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_sms BOOLEAN DEFAULT FALSE,
  notification_recipients JSONB,
  alert_cooldown_minutes INTEGER,
  description TEXT,
  applies_to_trunk_id UUID,
  applies_to_resource_type VARCHAR,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_configuration_type ON system_configuration(type, enabled);
CREATE INDEX idx_system_configuration_trunk ON system_configuration(applies_to_trunk_id);

-- 6. Event
CREATE TABLE event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pbx_id VARCHAR,
  event_type VARCHAR NOT NULL,
  related_entity_type VARCHAR NOT NULL,
  related_entity_id UUID,
  description TEXT NOT NULL,
  severity VARCHAR NOT NULL,
  triggered_by VARCHAR,
  alert_config_id UUID,
  event_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR,
  resolution_notes TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  correlation_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_type ON event(event_type, timestamp);
CREATE INDEX idx_event_severity ON event(severity, resolved, timestamp);
CREATE INDEX idx_event_entity ON event(related_entity_type, related_entity_id);
CREATE INDEX idx_event_pbx ON event(pbx_id, timestamp);

-- 7. Alert Management
CREATE TABLE alert_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pbx_id VARCHAR,
  alert_type VARCHAR NOT NULL,
  severity VARCHAR NOT NULL,
  trunk_id UUID,
  trunk_name VARCHAR,
  device_id UUID,
  device_name VARCHAR,
  config_rule_id UUID,
  description TEXT NOT NULL,
  alert_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  status VARCHAR NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by VARCHAR,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR,
  resolution_notes TEXT,
  notified BOOLEAN DEFAULT FALSE,
  notification_recipients JSONB,
  notification_retry_count INTEGER DEFAULT 0,
  last_notification_attempt TIMESTAMPTZ,
  correlation_id VARCHAR,
  parent_alert_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_management_type ON alert_management(alert_type, status, timestamp);
CREATE INDEX idx_alert_management_severity ON alert_management(severity, status, timestamp);
CREATE INDEX idx_alert_management_trunk ON alert_management(trunk_id, timestamp);
CREATE INDEX idx_alert_management_device ON alert_management(device_id, timestamp);
CREATE INDEX idx_alert_management_status ON alert_management(status, timestamp);