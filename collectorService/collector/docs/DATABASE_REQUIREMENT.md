# SAT Monitor - Database Requirements & Data Flow

## 📋 Overview
This document maps user requirements to database tables, showing what data flows where and how often.

---

## 🎯 REQUIREMENT 1: REAL-TIME MONITORING

### 1.1 Trunk Status
**Requirement:** Show whether trunk is on/off (SBC ↔ MNO, Customer, NAS, Gateway)

**Database Tables:**
```
trunk_status_history
├── pbx_id (which PBX)
├── trunk_id (which trunk)
├── trunk_name
├── status (0=down, 1=up, 41=reg_failed, 42=unreachable)
├── status_text ('idle', 'busy', 'unreachable', 'disabled')
├── changed_at (when status changed)
└── duration_seconds (how long in this status)

UPDATE FREQUENCY: On status change (WebSocket event 30010)
DATA SOURCE: WebSocket events + Polling (every 5s)
USAGE: UI dashboard, Alert system
```

**Current State:** ✅ Table exists, ⚠️ Not populating yet

---

### 1.2 IP Reachability (from SAT Monitor and SBC)
**Requirement:** Check if IPs are reachable
- From SAT Monitor → Gateway, NAS, MNO, Customer Server, Google
- From SBC → Gateway, NAS, MNO, Customer Server, Google

**Database Tables:**
```
network_metrics (SAT Monitor pings)
├── host (IP or hostname)
├── is_reachable (boolean)
├── latency_ms (ping time)
└── timestamp

device_latency_metrics (SBC ↔ Devices)
├── source_device ('sbc' or IP)
├── target_device (Gateway/NAS/MNO IP)
├── latency_ms
├── is_reachable
└── timestamp

UPDATE FREQUENCY: Every 30 seconds
DATA SOURCE: Ping service (network-monitor.service.ts)
USAGE: UI dashboard, Alert system (ping timeouts)
```

**Current State:** ✅ network_metrics working, ❌ device_latency_metrics not implemented

---

### 1.3 Link Latency
**Requirement:** Measure latency between all components

**Latency Pairs Needed:**
1. SBC ↔ Gateway
2. SBC ↔ NAS
3. SBC ↔ MNO
4. SBC ↔ Customer Server
5. SBC ↔ Google
6. SAT Monitor ↔ Gateway
7. SAT Monitor ↔ NAS
8. SAT Monitor ↔ Customer Server
9. SAT Monitor ↔ Google

**Database Tables:**
```
device_latency_metrics
├── source_device (e.g., 'sbc', 'sat-monitor')
├── target_device (e.g., 'gateway', 'nas', 'mno')
├── latency_ms
├── is_reachable
└── timestamp

UPDATE FREQUENCY: Every 30 seconds
DATA SOURCE: ICMP ping (from SAT Monitor) + SNMP/API (from SBC)
USAGE: UI latency graphs, Alert system (latency > threshold)
```

**Current State:** ⚠️ Table exists, ❌ Not implemented (need SNMP or SBC API)

---

### 1.4 Link Bandwidth
**Requirement:** Monitor bandwidth usage between components

**Database Tables:**
```
device_bandwidth_metrics
├── device_ip (which device)
├── network_interface (eth0, eth1, etc.)
├── bytes_in (total bytes received)
├── bytes_out (total bytes sent)
├── bandwidth_in_mbps (calculated rate)
├── bandwidth_out_mbps (calculated rate)
├── utilization_percent (% of link capacity)
└── timestamp

UPDATE FREQUENCY: Every 60 seconds
DATA SOURCE: SNMP queries to routers/switches
USAGE: UI bandwidth graphs, Alert system (over/under utilization)
```

**Current State:** ⚠️ Table exists, ❌ Not implemented (need SNMP)

---

### 1.5 Active Calls
**Requirement:** Show concurrent calls at each moment

**Database Tables:**
```
active_calls_snapshot (new table needed)
├── pbx_id
├── trunk_id (null if all trunks)
├── direction ('inbound', 'outbound', 'internal')
├── total_active_calls
├── timestamp

call_events (from WebSocket)
├── call_id
├── trunk_id
├── from_number
├── to_number
├── status ('ringing', 'answered', 'ended')
├── start_time
├── end_time
└── duration_seconds

UPDATE FREQUENCY: Every 5 seconds (snapshot) + Real-time (events)
DATA SOURCE: PBX API /call/query + WebSocket events
USAGE: UI active calls widget, Dashboard counters
```

**Current State:** ❌ Not implemented (API call exists but not storing)

---

### 1.6 Failed Calls (Daily Count)
**Requirement:** Total failed calls since day began

**Database Tables:**
```
daily_call_stats
├── pbx_id
├── date
├── total_calls
├── answered_calls
├── failed_calls ← THIS
├── unanswered_calls
├── rejected_calls
├── total_duration_seconds
└── avg_duration_seconds

UPDATE FREQUENCY: Aggregate every 15 minutes from CDR
DATA SOURCE: CDR table (call detail records)
USAGE: UI dashboard counters, Reports
```

**Current State:** ⚠️ Table exists, ❌ Not populating (need CDR aggregation)

---

### 1.7 Unanswered Calls (Daily Count)
**Same as 1.6** — Uses `daily_call_stats.unanswered_calls`

---

### 1.8 Rejected Calls (Daily Count)
**Same as 1.6** — Uses `daily_call_stats.rejected_calls`

---

## 🎯 REQUIREMENT 2: STATISTICS & REPORTS

### 2.1 Total Trunk Drops
**Requirement:** Count how many times trunks went down in a period

**Database Query:**
```sql
SELECT COUNT(*) as total_drops
FROM trunk_status_history
WHERE status IN (41, 42, 43, 44)  -- Down statuses
  AND changed_at BETWEEN '2026-01-01' AND '2026-01-31';
```

**Data Source:** `trunk_status_history` table
**Report Output:** Excel/PDF

---

### 2.2 Total IP Ping Timeouts
**Requirement:** Count ping failures

**Database Query:**
```sql
SELECT host, COUNT(*) as timeout_count
FROM network_metrics
WHERE is_reachable = false
  AND timestamp BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY host;
```

**Data Source:** `network_metrics` table

---

### 2.3 Total Time Between Drop & Reconnection
**Requirement:** Measure downtime duration

**Database Query:**
```sql
SELECT trunk_id, SUM(duration_seconds) as total_downtime_seconds
FROM trunk_status_history
WHERE status != 1  -- Not idle (i.e., down)
  AND changed_at BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY trunk_id;
```

**Data Source:** `trunk_status_history.duration_seconds`

---

### 2.4 Average Latency (max, min, total)
**Requirement:** Latency statistics

**Database Query:**
```sql
SELECT 
  target_device,
  AVG(latency_ms) as avg_latency,
  MAX(latency_ms) as max_latency,
  MIN(latency_ms) as min_latency
FROM device_latency_metrics
WHERE timestamp BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY target_device;
```

**Data Source:** `device_latency_metrics` table

---

### 2.5 Average Bandwidth (max, min, total)
**Requirement:** Bandwidth statistics

**Database Query:**
```sql
SELECT 
  device_ip,
  AVG(bandwidth_out_mbps) as avg_bandwidth,
  MAX(bandwidth_out_mbps) as max_bandwidth,
  MIN(bandwidth_out_mbps) as min_bandwidth
FROM device_bandwidth_metrics
WHERE timestamp BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY device_ip;
```

**Data Source:** `device_bandwidth_metrics` table

---

### 2.6-2.9 Average Calls Per Minute
**Requirement:** Call statistics (concurrent, failed, no answer, rejected)

**New Table Needed:**
```sql
CREATE TABLE minute_call_stats (
  id UUID PRIMARY KEY,
  pbx_id VARCHAR,
  minute_timestamp TIMESTAMPTZ,  -- Rounded to minute
  concurrent_calls INTEGER,
  failed_calls INTEGER,
  unanswered_calls INTEGER,
  rejected_calls INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_minute_stats_time ON minute_call_stats(minute_timestamp);
```

**UPDATE FREQUENCY:** Every minute (aggregate from CDR)

---

## 🎯 REQUIREMENT 3: NOTIFICATIONS

### Alert Rules Configuration
**Database Table:**
```
alert_rules
├── rule_name ('Trunk Down Alert', 'High Latency Alert')
├── resource_type ('trunk', 'network', 'bandwidth', 'calls')
├── condition_type ('down', 'latency_high', 'bandwidth_high', 'concurrent_calls_high')
├── threshold_value (e.g., 200 for latency > 200ms)
├── threshold_operator ('>', '<', '=', '>=', '<=')
├── enabled (true/false)
├── notify_email (true/false)
└── notify_sms (true/false)

USAGE: Alert system reads this to know when to trigger alerts
```

### Alert History (For Notification Team)
**New Table Needed:**
```sql
CREATE TABLE alert_history (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES alert_rules(id),
  resource_type VARCHAR,
  resource_id VARCHAR,  -- trunk_id, host, etc.
  alert_type VARCHAR,   -- 'trunk_down', 'latency_high'
  triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  severity VARCHAR,     -- 'critical', 'warning', 'info'
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📊 DATA FLOW SUMMARY

### Real-Time Data (Immediate)
```
PBX WebSocket Events
  ↓
Event Processor
  ↓
Database Tables:
  - events
  - extension_events
  - agent_events
  - trunk_status_history
  - extension_status_history
  ↓
UI Dashboard (via API)
Alert System (checks thresholds)
```

### Periodic Data (Every 5-60 seconds)
```
Monitoring Service (Polls PBX API)
  ↓
In-Memory Cache
  ↓
Database Tables:
  - active_calls_snapshot
  - trunk_status_history (if changed)
  ↓
UI Dashboard
```

### Network Monitoring (Every 30 seconds)
```
Ping Service
  ↓
network_metrics table
  ↓
UI Latency Graphs
Alert System (ping failures)
```

### Aggregated Data (Every 1-15 minutes)
```
CDR Records
  ↓
Aggregation Service
  ↓
Database Tables:
  - daily_call_stats
  - minute_call_stats
  ↓
Reports
UI Statistics
```

---

## ✅ IMPLEMENTATION CHECKLIST

### High Priority (For UI & Alerts)
- [x] network_metrics (working)
- [ ] trunk_status_history (table exists, need to populate)
- [ ] extension_status_history (table exists, need to populate)
- [ ] active_calls_snapshot (need to create)
- [ ] daily_call_stats (table exists, need CDR aggregation)
- [ ] alert_rules (table exists, need to populate)
- [ ] alert_history (need to create table)

### Medium Priority (For Reports)
- [ ] minute_call_stats (need to create)
- [ ] device_latency_metrics (table exists, need SNMP/SBC API)
- [ ] device_bandwidth_metrics (table exists, need SNMP)

### Configuration Needed
- [ ] monitored_devices (populate with Gateway, NAS, MNO, Customer IPs)
- [ ] alert_rules (create default rules)

---

## 🎯 NEXT STEPS

1. **Populate Status History Tables**
   - Modify `monitoring.service.ts` to write status changes
   
2. **Create Active Calls Snapshot**
   - New table + service to poll /call/query every 5s

3. **CDR Aggregation Service**
   - Query CDR, aggregate into daily_call_stats

4. **Configure Monitored Devices**
   - Insert Gateway, NAS, MNO, Customer Server IPs

5. **Setup Alert Rules**
   - Create default alert rules for common scenarios

---

## 📁 FILES TO CREATE/MODIFY
```
src/
├── services/
│   ├── call-aggregation.service.ts (NEW - aggregate CDR)
│   ├── status-history.service.ts (NEW - write status changes)
│   └── active-calls.service.ts (NEW - snapshot active calls)
├── persistence/entities/
│   ├── active-calls-snapshot.entity.ts (NEW)
│   ├── minute-call-stats.entity.ts (NEW)
│   └── alert-history.entity.ts (NEW)
└── migrations/
    └── 17XXXXXXXXX-AddMissingTables.ts (NEW)
```

---

**End of Requirements Document**