# **SAT Monitor – API-First Technical Interpretation & Implementation Strategy**

## Purpose of This Document

This reinterpretation focuses on **production-safe, vendor-compliant monitoring**.

Key changes from the previous intern report:

* **Yeastar API is now the primary integration**
* AMI remains **optional / future extension**
* Architecture explicitly designed for **multi-PBX environments**

---

## Core Design Philosophy

1. Monitoring must survive UI failure
2. Monitoring must be event-driven, not request-driven
3. Monitoring must be deterministic, isolated, and safe

> SAT Monitor is **an infrastructure guardian**, not just a web app.

---

## Final Architecture Overview

### 1. Collector Service (Critical Path)

**Responsibilities:**

* Connect to Yeastar PBX via:

  * **Yeastar API** (primary source)
  * AMI (optional/future)
* ICMP ping monitoring on internal/external targets
* Apply thresholds (latency, packet loss)
* Persist all events and metrics into PostgreSQL
* Emit **normalized state-change events**

**Key Characteristics:**

* Independent of Next.js UI
* Auto-reconnect on PBX or network failure
* Never exposes credentials externally
* 24/7 uptime

> If this process dies, SAT Monitor is blind.

---

### 2. Realtime Gateway (Event Distribution Layer)

**Responsibilities:**

* Receive events from Collector Service
* Push updates to dashboards via WebSockets
* Stateless, can restart without data loss

**Purpose:**

* Prevents Next.js from handling long-lived sockets
* Allows future alert channels (SMS, email, Slack)

---

### 3. Next.js Application (Presentation Layer)

**Responsibilities:**

* Authentication & RBAC (internal admins only)
* Dashboard UI: trunks, network status, history
* Read-only API for querying data
* WebSocket client for real-time updates

**Explicitly does NOT:**

* Poll PBX
* Run cron jobs
* Ping networks
* Handle credentials

Separation ensures **UI crashes don’t affect monitoring**.

---

## Yeastar Integration Strategy

### Yeastar API (Primary Source)

* Pull trunk status, configuration, and registration info
* Poll at configurable intervals (e.g., 15–60 sec)
* Validate collector state and reconcile inconsistencies

### AMI (Optional / Future)

* Event-driven real-time alerts
* Only used if access is granted
* Requires:

  * Reconnection logic
  * Heartbeat validation
  * Event deduplication

> Current design **focuses on API** for production compliance.

---

## Network Monitoring Strategy

* ICMP ping via system tools (`fping` or equivalent)
* Metrics: average latency, packet loss, optional jitter
* Thresholds: Normal → High Latency → Down
* Append-only logging for historical analysis

---

## Alerting Model

* Alerts are **stateful**, not reactive
* Trigger only on **state changes**
* Cooldown windows prevent alert storms
* Escalation logic can be added later

> Ensures alerts are meaningful and trusted

---

## Deployment Model

* Single Proxmox VM (Ubuntu Server 22.04)
* System services:

  * `collector.service` (API-first)
  * `realtime-gateway.service`
  * `nextjs.service`
* Internal-only networking
* PostgreSQL hosted internally
* Designed to scale to **multiple PBX images**

---

## Why This Design Was Chosen

* Matches **real-world telecom/NOC monitoring**
* Prevents cascading failures
* Scales horizontally for multiple PBXs
* Maintains **security boundaries**
* API-first approach ensures **vendor compliance** and reliability

> SAT Monitor is not a demo — it is a **production-ready observer system**.

---

If you want, I can **also update the architecture diagram** to show **API as primary, AMI as optional**, ready for mentor review. It’ll make the architecture visually crystal clear.

Do you want me to do that next?
