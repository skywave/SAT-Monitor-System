# Core Requirements for SAT Monitor System

- Monitor trunks (VoIP lines).  
- Log ping/status checks (network health).  
- Store alerts if something goes wrong.  
- Possibly store users/administrators who view the system.  
- Keep timestamps of all events.  
- Track system configuration (optional, e.g., thresholds for alerts).  

**So the schema should have tables for:**

- `trunks`  
- `ping_logs`  
- `trunk_status`  
- `alerts`  
- `users` (mandatory)  
- `settings` (optional)  

---

# Suggested Tables & Columns

## Table 1: trunks

Stores all trunks being monitored.

| Column Name  | Type             | Notes                          |
|-------------|-----------------|--------------------------------|
| trunk_id    | SERIAL PRIMARY KEY | Unique ID for each trunk       |
| name        | VARCHAR(50)       | Friendly name for trunk        |
| ip_address  | VARCHAR(15)       | IP of the trunk or endpoint    |
| status      | VARCHAR(20)       | 'up', 'down', 'unknown'       |
| last_checked| TIMESTAMP         | Last time this trunk was monitored |
| created_at  | TIMESTAMP         | Default: now()                |
| updated_at  | TIMESTAMP         | Default: now()                |

---

## Table 2: ping_logs

Stores ping results for trunks or network devices.

| Column Name     | Type                | Notes                       |
|-----------------|-------------------|-----------------------------|
| ping_id         | SERIAL PRIMARY KEY | Unique ID                   |
| trunk_id        | INT REFERENCES trunks(trunk_id) | Which trunk/device |
| response_time_ms| INT                | Round-trip time in milliseconds |
| status          | VARCHAR(20)        | 'success', 'timeout', 'failed' |
| created_at      | TIMESTAMP          | Time of ping                |

---

## Table 3: trunk_status

Optional table if you want historical status logs instead of just current status in `trunks`.

| Column Name  | Type                     | Notes                       |
|-------------|-------------------------|-----------------------------|
| status_id   | SERIAL PRIMARY KEY       | Unique ID                   |
| trunk_id    | INT REFERENCES trunks(trunk_id) | Trunk ID             |
| status      | VARCHAR(20)             | 'up', 'down'               |
| checked_at  | TIMESTAMP               | Time of status check        |
| notes       | TEXT                    | Optional messages           |

---

## Table 4: alerts

Stores alerts triggered when trunks go down or pings fail.

| Column Name  | Type                     | Notes                        |
|-------------|-------------------------|------------------------------|
| alert_id    | SERIAL PRIMARY KEY       | Unique alert ID             |
| trunk_id    | INT REFERENCES trunks(trunk_id) | Which trunk          |
| alert_type  | VARCHAR(50)             | 'ping_failed', 'trunk_down', etc. |
| severity    | VARCHAR(20)             | 'low', 'medium', 'high'     |
| description | TEXT                    | Optional description         |
| created_at  | TIMESTAMP               | When alert was triggered     |
| resolved_at | TIMESTAMP               | Null if not resolved         |

---

## Table 5: users

For multi-user system.

| Column Name   | Type             | Notes                       |
|---------------|-----------------|-----------------------------|
| user_id       | SERIAL PRIMARY KEY | Unique user ID             |
| username      | VARCHAR(50)       | Login name                 |
| password_hash | VARCHAR(255)      | Hashed password            |
| role          | VARCHAR(20)       | 'admin', 'viewer', etc.   |
| created_at    | TIMESTAMP         | Account created            |
| last_login    | TIMESTAMP         | Last login time            |

---

## Table 6: settings (optional)

| Column Name  | Type             | Notes                           |
|-------------|-----------------|---------------------------------|
| setting_id  | SERIAL PRIMARY KEY | Unique                        |
| name        | VARCHAR(50)       | e.g., 'ping_timeout_ms'        |
| value       | VARCHAR(50)       | e.g., '500' (ms)               |
| description | TEXT              | Optional                       |
| updated_at  | TIMESTAMP         | Last updated                   |

---

# Relationships Overview

- **One-to-Many:** `trunks` → `ping_logs` (a trunk has many ping logs)  
- **One-to-Many:** `trunks` → `alerts` (a trunk can trigger multiple alerts)  
- **One-to-Many:** `trunks` → `trunk_status` (historical status changes)
