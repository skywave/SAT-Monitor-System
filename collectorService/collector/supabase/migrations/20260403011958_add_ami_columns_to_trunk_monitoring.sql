-- Add AMI columns to trunk_monitoring table
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
COMMENT ON COLUMN trunk_monitoring.ami_last_checked IS 'Timestamp of last AMI poll';