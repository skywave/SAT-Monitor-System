-- ============================================
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
COMMENT ON TABLE event IS 'Phase 1: Raw events from PBX WebSocket (audit log)';