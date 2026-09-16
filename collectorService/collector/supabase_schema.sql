-- 1. Setup Extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.agent_events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    event_type character varying NOT NULL,
    agent_id character varying,
    agent_name character varying,
    agent_status integer,
    queue_id character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    rule_name character varying NOT NULL,
    resource_type character varying NOT NULL,
    condition_type character varying NOT NULL,
    threshold_value numeric(10,2) NOT NULL,
    threshold_operator character varying NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    notify_email boolean DEFAULT true NOT NULL,
    notify_sms boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.call_transfer_events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    call_id character varying NOT NULL,
    from_party character varying,
    to_party character varying,
    transferrer character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_call_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    date date NOT NULL,
    total_calls integer DEFAULT 0 NOT NULL,
    answered_calls integer DEFAULT 0 NOT NULL,
    failed_calls integer DEFAULT 0 NOT NULL,
    unanswered_calls integer DEFAULT 0 NOT NULL,
    rejected_calls integer DEFAULT 0 NOT NULL,
    total_duration_seconds integer DEFAULT 0 NOT NULL,
    avg_duration_seconds numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT UQ_daily_call_stats UNIQUE (pbx_id, date)
);

CREATE TABLE IF NOT EXISTS public.device_bandwidth_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    device_ip character varying NOT NULL,
    interface_name character varying NOT NULL,
    bytes_in bigint DEFAULT '0'::bigint NOT NULL,
    bytes_out bigint DEFAULT '0'::bigint NOT NULL,
    bandwidth_in_mbps numeric(10,2),
    bandwidth_out_mbps numeric(10,2),
    utilization_percent numeric(5,2),
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.device_latency_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    source_device character varying NOT NULL,
    target_device character varying NOT NULL,
    latency_ms numeric(10,2),
    is_reachable boolean DEFAULT false NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    event_type character varying NOT NULL,
    event_id character varying,
    resource_type character varying NOT NULL,
    resource_id character varying,
    resource_name character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.extension_events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    event_type character varying NOT NULL,
    ext_id character varying,
    ext_name character varying,
    registration_status integer,
    call_status integer,
    call_id character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.extension_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    ext_id character varying NOT NULL,
    ext_name character varying,
    status integer NOT NULL,
    status_text character varying,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.monitored_devices (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    device_name character varying NOT NULL,
    device_type character varying NOT NULL,
    ip_address character varying NOT NULL UNIQUE,
    snmp_community character varying DEFAULT 'public'::character varying NOT NULL,
    snmp_port integer DEFAULT 161 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.network_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    host character varying NOT NULL,
    is_reachable boolean DEFAULT false NOT NULL,
    latency_ms double precision,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.network_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    host character varying NOT NULL,
    status character varying NOT NULL,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.state_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    resource_type character varying NOT NULL,
    resource_id character varying,
    previous_state jsonb,
    current_state jsonb,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.trunk_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    trunk_id character varying NOT NULL,
    trunk_name character varying,
    status integer NOT NULL,
    status_text character varying,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Migration Tracking (Simplified for Supabase)
CREATE TABLE IF NOT EXISTS public.migrations (
    id SERIAL PRIMARY KEY,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS "IDX_latency" ON public.device_latency_metrics (source_device, target_device, "timestamp");
CREATE INDEX IF NOT EXISTS "IDX_trunk_id" ON public.trunk_status_history (trunk_id);
CREATE INDEX IF NOT EXISTS "IDX_trunk_history" ON public.trunk_status_history (pbx_id, changed_at);
CREATE INDEX IF NOT EXISTS "IDX_ext_id" ON public.extension_status_history (ext_id);
CREATE INDEX IF NOT EXISTS "IDX_network_metrics" ON public.network_metrics (host, "timestamp");
CREATE INDEX IF NOT EXISTS "IDX_network_status" ON public.network_status_history (host, changed_at);
CREATE INDEX IF NOT EXISTS "IDX_alert_rules" ON public.alert_rules (resource_type);
CREATE INDEX IF NOT EXISTS "IDX_ext_history" ON public.extension_status_history (pbx_id, changed_at);
CREATE INDEX IF NOT EXISTS "IDX_bandwidth" ON public.device_bandwidth_metrics (device_ip, "timestamp");
CREATE INDEX IF NOT EXISTS "IDX_daily_stats" ON public.daily_call_stats (pbx_id, date);-- Drop old tables (if they exist)
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
  related_entity_id VARCHAR,
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
CREATE INDEX idx_alert_management_status ON alert_management(status, timestamp);-- ============================================
-- PHASE 1 SCHEMA SIMPLIFICATION
-- ============================================

-- 1. Simplify trunk_monitoring table
ALTER TABLE trunk_monitoring 
  DROP COLUMN IF EXISTS peer_name,
  DROP COLUMN IF EXISTS source_type,
  DROP COLUMN IF EXISTS destination_type,
  DROP COLUMN IF EXISTS source_ip,
  DROP COLUMN IF EXISTS destination_ip,
  DROP COLUMN IF EXISTS ip_reachability,
  DROP COLUMN IF EXISTS uptime_seconds,
  DROP COLUMN IF EXISTS downtime_seconds,
  DROP COLUMN IF EXISTS mno_info,
  DROP COLUMN IF EXISTS devices_connected,
  DROP COLUMN IF EXISTS notes;

-- Add comments for Phase 2 fields (keep them)
COMMENT ON COLUMN trunk_monitoring.current_latency_ms IS 'Phase 2: Will be populated when SBC access available';
COMMENT ON COLUMN trunk_monitoring.current_bandwidth_in IS 'Phase 2: Will be populated when SBC access available';
COMMENT ON COLUMN trunk_monitoring.current_bandwidth_out IS 'Phase 2: Will be populated when SBC access available';

-- 2. Simplify call_monitoring table - only remove columns that actually exist
-- First, check what columns exist (run in Supabase SQL editor if unsure)
-- Then uncomment the columns that actually exist in your table

-- Remove columns if they exist (using DO block to avoid errors)
DO $$ 
BEGIN
    -- Try to drop columns only if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'peak_concurrent_calls') THEN
        ALTER TABLE call_monitoring DROP COLUMN peak_concurrent_calls;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'busy_calls') THEN
        ALTER TABLE call_monitoring DROP COLUMN busy_calls;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'internal_calls') THEN
        ALTER TABLE call_monitoring DROP COLUMN internal_calls;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'completed_calls') THEN
        ALTER TABLE call_monitoring DROP COLUMN completed_calls;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'max_duration_seconds') THEN
        ALTER TABLE call_monitoring DROP COLUMN max_duration_seconds;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'min_duration_seconds') THEN
        ALTER TABLE call_monitoring DROP COLUMN min_duration_seconds;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'mno_distribution') THEN
        ALTER TABLE call_monitoring DROP COLUMN mno_distribution;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'avg_call_setup_time_ms') THEN
        ALTER TABLE call_monitoring DROP COLUMN avg_call_setup_time_ms;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_monitoring' AND column_name = 'call_success_rate_percent') THEN
        ALTER TABLE call_monitoring DROP COLUMN call_success_rate_percent;
    END IF;
END $$;

-- 3. Ensure network_monitoring has Phase 1 fields
ALTER TABLE network_monitoring 
  ADD COLUMN IF NOT EXISTS packet_loss_percent FLOAT,
  ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'sat-monitor';

-- 4. Ensure alert_management has proper indexes
CREATE INDEX IF NOT EXISTS idx_alert_management_status_timestamp 
  ON alert_management(status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alert_management_trunk_id 
  ON alert_management(trunk_id) WHERE trunk_id IS NOT NULL;

-- 5. Add comments for documentation
COMMENT ON TABLE trunk_monitoring IS 'Phase 1: Trunk status from PBX polling. Phase 2 fields: current_latency_ms, current_bandwidth_in/out';
COMMENT ON TABLE call_monitoring IS 'Phase 1: Call statistics aggregated every minute from PBX CDR';
COMMENT ON TABLE network_monitoring IS 'Phase 1: ICMP ping results from SAT Monitor to network endpoints';
COMMENT ON TABLE alert_management IS 'Phase 1: Alerts triggered by trunk status changes and threshold violations';
COMMENT ON TABLE system_configuration IS 'Phase 1: Default alert thresholds seeded on startup';
COMMENT ON TABLE event IS 'Phase 1: Raw events from PBX WebSocket (audit log)';-- Add AMI columns to trunk_monitoring table
ALTER TABLE trunk_monitoring 
  ADD COLUMN IF NOT EXISTS ami_latency_ms FLOAT,
  ADD COLUMN IF NOT EXISTS ami_jitter_ms FLOAT,
  ADD COLUMN IF NOT EXISTS ami_packet_loss_pct FLOAT,
  ADD COLUMN IF NOT EXISTS ami_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ami_last_checked TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trunk_monitoring_ami_last_checked 
  ON trunk_monitoring(ami_last_checked) 
  WHERE ami_last_checked IS NOT NULL;

-- Add comments
COMMENT ON COLUMN trunk_monitoring.ami_latency_ms IS 'Latency from AMI SIPshowpeer (ms)';
COMMENT ON COLUMN trunk_monitoring.ami_jitter_ms IS 'Jitter from AMI SIPshowpeer (ms)';
COMMENT ON COLUMN trunk_monitoring.ami_packet_loss_pct IS 'Packet loss from AMI SIPshowpeer (%)';
COMMENT ON COLUMN trunk_monitoring.ami_status IS 'Registration status from AMI (Registered/Unreachable)';
COMMENT ON COLUMN trunk_monitoring.ami_last_checked IS 'Timestamp of last AMI poll';-- supabase/migrations/YYYYMMDDHHMMSS_sync_call_monitoring_columns.sql

-- Add missing Phase 2 columns to call_monitoring
ALTER TABLE call_monitoring 
  ADD COLUMN IF NOT EXISTS peak_concurrent_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS busy_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS internal_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS min_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS mno_distribution JSONB;