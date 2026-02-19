# SAT Collector – NestJS Project Structure

This NestJS project implements the SAT Monitor backend **collector daemon**. It is not a web UI.

## 📌 Root Files
- **main.ts** — bootstraps the NestJS application as a background process (no HTTP server).
- **app.module.ts** — root module that imports all feature modules.

## 📂 config
Holds configuration logic (environment, PBX settings, database config).

## 📂 health
Contains health check logic (liveness/readiness probes) for the daemon.

## 📂 pbx
Core domain for interfacing with PBXs:
- **pbx.module.ts** — Nest module for the PBX domain.
- **pbx.manager.ts** — orchestrates all PBX instances.
- **scheduler.ts** — controls polling intervals, staggering, backoff logic.
- `/instance`
  - **pbx.instance.ts** — runtime object representing one PBX.
  - **api.client.ts** — HTTP API client for P-Series PBX (login, fetch endpoints).
  - **state.machine.ts** — PBX state machine logic.
  - **trunk.manager.ts** — tracks trunks within a PBX.
  - **health.monitor.ts** — monitors PBX health (API + network).

## 📂 persistence
Responsible for writing events and states to the database:
- **event.writer.ts**
- **state.writer.ts**

These are write‑only adapters.

## 📂 transport
Handles event emission out of the system (to Gateway or bus):
- **emitter.service.ts**

## 📂 supervisor
Observes system health and helps with graceful shutdowns:
- **supervisor.service.ts**

## 📂 shared
Reusable utilities and types:
- Logging
- Type definitions
- Enums
- Helpers

## 🧠 How it works at runtime
1. **Bootstrap**
   - NestJS creates application context. Injects singletons.
2. **PBXManager** loads PBX configs.
3. **PBXInstance** uses **APIClient** to talk to Yeastar P‑Series.
4. **StateMachine** interprets API responses into states.
5. **PersistenceLayer** writes events/states to DB.
6. **TransportEmitter** sends changes to the Gateway.

## 📚 Docs you should reference
- Yeastar P‑Series API Overview:  
  https://help.yeastar.com/en/p-series-appliance-edition/developer-guide/about-this-guide.html :contentReference[oaicite:5]{index=5}  
- Enable API Access on PBX:  
  https://help.yeastar.com/en/p-series-appliance-edition/developer-guide/enable-yeastar-p-series-pbx-api.html :contentReference[oaicite:6]{index=6}
