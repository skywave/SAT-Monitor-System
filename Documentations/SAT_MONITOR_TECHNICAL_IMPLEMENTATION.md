# SAT Monitor – Technical Interpretation & Implementation Strategy

## Purpose of This Document
This document reinterprets the original SAT Monitor technical design from an **engineering-first, production-safe perspective**.

The goal is not to restate the intern report, but to:
- Correct architectural risks
- Clarify how the system will *actually* run in reality
- Define how each component will be used in operation

Monitoring systems are **infrastructure guardians**, not web apps. This document reflects that philosophy.

---

## Core Design Philosophy

**Rule 1: Monitoring must survive UI failure**  
**Rule 2: Monitoring must be event-driven, not request-driven**  
**Rule 3: Monitoring must be boring, deterministic, and isolated**

The SAT Monitor is therefore split into **independent services**, even if deployed on the same VM.

---

## Final Architecture Overview

The system is composed of **three logical layers**:

### 1. Collector Service (Critical Path)
This is the heart of SAT Monitor.

**Responsibilities:**
- Connect to Yeastar PBX via:
  - AMI (event-based, real-time)
  - Yeastar API (periodic snapshot validation)
- Perform ICMP ping monitoring on internal/external targets
- Apply threshold logic (latency, packet loss)
- Persist all events and metrics into PostgreSQL
- Emit normalized state-change events

**Key Characteristics:**
- Runs independently of Next.js
- Must auto-reconnect on PBX or network failure
- Never exposes credentials externally
- Designed to run 24/7 without human interaction

> If this process dies, SAT Monitor is blind.

---

### 2. Realtime Gateway (Event Distribution Layer)

**Responsibilities:**
- Receive events from Collector Service
- Push updates to connected dashboards via WebSockets
- Remain stateless (can restart without data loss)

**Why this exists:**
- Prevents Next.js from handling long-lived sockets
- Allows future expansion (SMS, email, Slack, etc.)

---

### 3. Next.js Application (Presentation Layer)

**Responsibilities:**
- Authentication & RBAC (internal admins only)
- Dashboard UI (trunks, network status, history)
- Read-only APIs for querying data
- WebSocket client for real-time updates

**Explicitly does NOT:**
- Run cron jobs
- Poll PBX
- Ping networks
- Handle credentials

This separation ensures the UI can crash, reload, or be redeployed **without impacting monitoring**.

---

## Yeastar Integration Strategy

### AMI (Primary Source of Truth)
- Used for real-time detection of:
  - Trunk registration changes
  - Peer reachability
  - PBX-side failures
- Event-driven → instant reaction
- Requires:
  - Reconnection logic
  - Heartbeat validation
  - Event deduplication

### Yeastar API (Secondary / Validation)
- Used for:
  - Initial configuration sync
  - Periodic consistency checks
- Never relied upon for real-time alerts

---

## Network Monitoring Strategy

- ICMP ping executed via **system-level tools** (`fping` or equivalent)
- Metrics collected:
  - Average latency
  - Packet loss
  - Optional jitter
- Threshold-based state transitions:
  - Normal → High Latency → Down

All ping results are append-only for historical analysis.

---

## Alerting Model

Alerts are **stateful**, not reactive.

- Alerts trigger only on **state change**
- Cooldown windows prevent alert storms
- Escalation logic can be added later

This keeps alerts meaningful and trusted.

---

## Deployment Model

- Single Proxmox VM (Ubuntu Server 22.04)
- Multiple system services:
  - collector.service
  - realtime-gateway.service
  - nextjs.service
- Internal-only networking
- PostgreSQL hosted internally

---

## Why This Design Was Chosen

This architecture:
- Matches real-world NOC / telecom monitoring patterns
- Prevents cascading failures
- Scales horizontally if needed
- Keeps security boundaries clean
- Aligns with long-term maintainability

SAT Monitor is not a demo.
It is an **observer system**.

Observers must never sleep.
