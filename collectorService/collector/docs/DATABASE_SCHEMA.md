# SAT Monitor Database Schema

## Overview

The SAT Monitor system uses PostgreSQL with 15 tables and 7 views to store comprehensive monitoring data for PBX systems, network devices, and call statistics.

## Tables Overview

### Existing Tables (6)
- `events` - Raw PBX events
- `state_history` - Agent state changes
- `extension_events` - Extension-specific events
- `agent_events` - Agent activity events
- `call_transfer_events` - Call transfer records
- `network_metrics` - Network ping metrics

### New Tables (8)
- `daily_call_stats` - Daily call statistics
- `trunk_status_history` - Trunk up/down timeline
- `extension_status_history` - Extension online/offline timeline
- `network_status_history` - Network status changes
- `monitored_devices` - Device registry
- `device_latency_metrics` - Inter-device latency
- `device_bandwidth_metrics` - Bandwidth usage
- `alert_rules` - Alert configuration

## Table Details

### daily_call_stats
**Purpose:** Daily aggregated call statistics per PBX
**Key Columns:** pbx_id, date, total_calls, answered_calls, failed_calls, unanswered_calls, rejected_calls
**Constraints:** UNIQUE(pbx_id, date)

### trunk_status_history
**Purpose:** Historical trunk status changes
**Key Columns:** pbx_id, trunk_id, status, changed_at, duration_seconds
**Indexes:** (pbx_id, changed_at), (trunk_id)

### extension_status_history
**Purpose:** Historical extension status changes
**Key Columns:** pbx_id, ext_id, status, changed_at, duration_seconds
**Indexes:** (pbx_id, changed_at), (ext_id)

### network_status_history
**Purpose:** Network host reachability changes
**Key Columns:** host, status, changed_at, duration_seconds
**Indexes:** (host, changed_at)

### monitored_devices
**Purpose:** Registry of devices to monitor
**Key Columns:** device_name, device_type, ip_address, snmp_community, snmp_port
**Constraints:** UNIQUE(ip_address)

### device_latency_metrics
**Purpose:** Latency measurements between devices
**Key Columns:** source_device, target_device, latency_ms, is_reachable, timestamp
**Indexes:** (source_device, target_device, timestamp)

### device_bandwidth_metrics
**Purpose:** Bandwidth usage per device interface
**Key Columns:** device_ip, interface_name, bytes_in, bytes_out, bandwidth_in_mbps, bandwidth_out_mbps, utilization_percent
**Indexes:** (device_ip, timestamp)

### alert_rules
**Purpose:** Alert threshold configurations
**Key Columns:** rule_name, resource_type, condition_type, threshold_value, threshold_operator, enabled
**Indexes:** (resource_type)

## Views

### v_latest_trunk_status
**Purpose:** Latest status for each trunk
**Query:** DISTINCT ON (pbx_id, trunk_id) ordered by changed_at DESC

### v_latest_extension_status
**Purpose:** Latest status for each extension
**Query:** DISTINCT ON (pbx_id, ext_id) ordered by changed_at DESC

### v_latest_network_status
**Purpose:** Latest status for each network host
**Query:** DISTINCT ON (host) ordered by changed_at DESC

### v_today_call_stats
**Purpose:** Today's call statistics
**Query:** daily_call_stats WHERE date = CURRENT_DATE

### v_trunk_uptime_24h
**Purpose:** 24-hour uptime percentage per trunk
**Query:** Aggregates duration_seconds for status=1 vs total

### v_latest_device_latency
**Purpose:** Latest latency between device pairs
**Query:** DISTINCT ON (source_device, target_device) ordered by timestamp DESC

### v_latest_device_bandwidth
**Purpose:** Latest bandwidth metrics per device interface
**Query:** DISTINCT ON (device_ip, interface_name) ordered by timestamp DESC

## Example SQL Queries

### Check if trunk is down
```sql
SELECT * FROM v_latest_trunk_status
WHERE status != 1 AND changed_at < NOW() - INTERVAL '5 minutes';
```

### Get today's failed calls
```sql
SELECT * FROM v_today_call_stats
WHERE failed_calls > 0;
```

### Get average latency to router (last hour)
```sql
SELECT
  source_device,
  target_device,
  AVG(latency_ms) as avg_latency,
  COUNT(*) as measurements
FROM device_latency_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour'
  AND target_device LIKE '%router%'
GROUP BY source_device, target_device;
```

### Get trunk uptime percentage
```sql
SELECT * FROM v_trunk_uptime_24h
ORDER BY uptime_percentage ASC;
```

### Get devices that are unreachable
```sql
SELECT * FROM v_latest_device_latency
WHERE is_reachable = false;
```

### Get bandwidth usage by device
```sql
SELECT
  device_ip,
  interface_name,
  AVG(bandwidth_in_mbps) as avg_in,
  AVG(bandwidth_out_mbps) as avg_out,
  MAX(utilization_percent) as max_utilization
FROM device_bandwidth_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY device_ip, interface_name;
```

### Get call statistics for date range
```sql
SELECT
  date,
  SUM(total_calls) as total_calls,
  SUM(failed_calls) as failed_calls,
  ROUND(AVG(avg_duration_seconds), 2) as avg_duration
FROM daily_call_stats
WHERE date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY date
ORDER BY date;
```

## Instructions for UI Team

Use these views for dashboard displays:
- `v_latest_trunk_status` - Trunk status indicators
- `v_latest_extension_status` - Extension status lists
- `v_latest_network_status` - Network reachability status
- `v_today_call_stats` - Today's call metrics
- `v_trunk_uptime_24h` - Uptime percentages
- `v_latest_device_latency` - Device connectivity status
- `v_latest_device_bandwidth` - Bandwidth utilization charts

## Instructions for Alert Team

Monitor these tables for alert triggers:
- `trunk_status_history` - Status changes (up/down)
- `network_status_history` - Reachability changes
- `device_latency_metrics` - Latency threshold violations
- `device_bandwidth_metrics` - Bandwidth utilization alerts
- `daily_call_stats` - Call quality metrics

Use `alert_rules` table to configure thresholds and notification preferences.

## Connection Information

**Database:** PostgreSQL
**Host:** [TBD - configure in environment]
**Port:** 5432
**Database:** sat_monitor
**Schema:** public

Configure connection in `src/config/database.config.ts`