-- supabase/migrations/YYYYMMDDHHMMSS_sync_call_monitoring_columns.sql

-- Add missing Phase 2 columns to call_monitoring
ALTER TABLE call_monitoring 
  ADD COLUMN IF NOT EXISTS peak_concurrent_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS busy_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS internal_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS min_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS mno_distribution JSONB;