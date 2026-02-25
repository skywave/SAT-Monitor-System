## **🎯 Strategic Analysis**

### **What We're Building:**
A **real-time trunk & network monitoring system** that needs to:
1. Know **immediately** when a trunk goes down/up
2. Track call failures and routing issues
3. Monitor extension status (for debugging)
4. Store historical data for analytics

---

## **📊 WebSocket vs Webhook Decision**

For **SAT Monitor**, I recommend **WebSocket** as primary, with **Webhook as backup/secondary**:

### **Why WebSocket?**

✅ **Real-time** — trunk status changes push instantly (no polling delay)  
✅ **Bidirectional** — we can send heartbeat, subscribe/unsubscribe dynamically  
✅ **Lower latency** — persistent connection, no HTTP overhead per event  
✅ **Better for monitoring** — continuous stream of events  

### **Why NOT only Webhook?**

❌ Requires **public endpoint** (your Collector is internal)  
❌ **Less reliable** for high-frequency events (trunk flapping)  
❌ No way to confirm PBX → App connection is alive  

### **Hybrid Approach (Recommended):**

Use **WebSocket** for real-time monitoring, but also configure **Webhook as fallback** for critical events (trunk down, call failures) in case WebSocket disconnects.

---

## **🏗️ Architecture Plan**

### **Current Structure:**
```
SAT-Monitor-System/
├── collectorService/     ← We're here (NestJS)
├── gatewayService/       ← Will distribute events
└── FRONT/               ← Dashboard
```

### **New Event Monitoring Layer:**

```
collectorService/
├── src/
│   ├── pbx/                      ← Existing (API client)
│   ├── endpoints/                ← Existing (REST endpoints)
│   ├── events/                   ← NEW - Event monitoring
│   │   ├── events.module.ts
│   │   ├── websocket/
│   │   │   ├── websocket.service.ts      ← WebSocket client
│   │   │   ├── websocket.manager.ts      ← Manages connections per PBX
│   │   │   ├── heartbeat.service.ts      ← Keep-alive (60s timeout)
│   │   │   └── reconnect.strategy.ts     ← Auto-reconnect logic
│   │   ├── webhook/
│   │   │   ├── webhook.controller.ts     ← Receives webhook POSTs
│   │   │   └── webhook.validator.ts      ← Signature verification
│   │   ├── handlers/
│   │   │   ├── trunk-event.handler.ts    ← (30010) Trunk Registration Status
│   │   │   ├── call-event.handler.ts     ← (30011) Call State Changed
│   │   │   ├── extension-event.handler.ts ← (30007) Extension Status
│   │   │   └── cdr-event.handler.ts      ← (30012) Call End Details
│   │   ├── processors/
│   │   │   ├── event-normalizer.ts       ← Normalize event structure
│   │   │   ├── state-tracker.ts          ← Track state changes (avoid duplicates)
│   │   │   └── event-logger.ts           ← PostgreSQL persistence
│   │   └── types/
│   │       └── event.types.ts            ← Event interfaces (30005-30036)
│   ├── persistence/              ← Existing DB layer
│   └── transport/                ← Existing (emit to Gateway)
```

---

## **🔄 Event Flow Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         Yeastar PBX                             │
│  (Trunk goes down, call fails, extension registers, etc.)      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ WebSocket Push (real-time)
                 │ OR Webhook POST (fallback)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Collector Service (NestJS)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WebSocket Service                                       │  │
│  │  - Maintains connection per PBX                          │  │
│  │  - Sends heartbeat every 30s (avoid 60s timeout)         │  │
│  │  - Auto-reconnects on disconnect                         │  │
│  │  - Subscribes to events: 30007, 30010, 30011, 30012     │  │
│  └───────────────┬──────────────────────────────────────────┘  │
│                  │                                              │
│  ┌───────────────▼──────────────────────────────────────────┐  │
│  │  Event Normalizer                                        │  │
│  │  - Validates event structure                             │  │
│  │  - Extracts key fields (trunk_id, status, timestamp)     │  │
│  │  - Enriches with metadata                                │  │
│  └───────────────┬──────────────────────────────────────────┘  │
│                  │                                              │
│  ┌───────────────▼──────────────────────────────────────────┐  │
│  │  State Tracker (In-Memory Cache)                         │  │
│  │  - Tracks last known state (trunk: registered/down)      │  │
│  │  - Detects state CHANGES (only emit on change)           │  │
│  │  - Prevents duplicate alerts                             │  │
│  └───────────────┬──────────────────────────────────────────┘  │
│                  │                                              │
│         ┌────────┴────────┐                                     │
│         ▼                 ▼                                     │
│  ┌─────────────┐   ┌──────────────┐                           │
│  │ PostgreSQL  │   │  Transport   │ → Gateway Service          │
│  │  (persist)  │   │ (emit event) │                            │
│  └─────────────┘   └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   Gateway    │ → Dashboard (real-time UI)
                  │   Service    │ → Alerts (email/Slack)
                  └──────────────┘
```

---

## **🎯 Key Events for Trunk Monitoring**

From the 32 events available, you need **4 critical ones**:

| Event Code | Event Name | Why Critical |
|-----------|-----------|--------------|
| **30010** | Trunk Registration State Changed | 🔥 **Priority #1** — trunk down/up |
| **30011** | Call State Changed | Track active calls per trunk |
| **30012** | Call End Details (CDR) | Post-call analytics, failure tracking |
| **30023** | Trunk Information Updated | Config changes (alert if trunk disabled) |

**Optional but useful:**
- **30007** — Extension Registration Status (debugging)
- **30015** — Call Failure Report (detailed failure reasons)
- **30016** — Incoming Call Request (inbound trunk monitoring)

---

## **⚙️ Technical Challenges & Solutions**

### **Challenge 1: WebSocket Timeout (60 seconds)**

**Solution:** Heartbeat service sends `ping` every 30 seconds.

```
Every 30s → Send heartbeat
PBX responds → Connection alive
No response → Trigger reconnect
```

---

### **Challenge 2: Token Expiry (30 minutes)**

**Solution:** Reuse existing token refresh logic from `pbx.instance.ts`.

```
Token refresh triggered at 25 min
WebSocket uses refreshed token
Connection stays alive
```

---

### **Challenge 3: Event Deduplication**

**Problem:** PBX might send duplicate events (trunk flapping, reconnects).

**Solution:** State tracker with last-known-state cache.

```typescript
// Pseudocode
if (event.trunk_status === lastKnownState[trunk_id]) {
  // No change, ignore
  return;
}

// State changed, emit event
lastKnownState[trunk_id] = event.trunk_status;
emit(event);
```

---

### **Challenge 4: Multi-PBX Support**

**Problem:** You might monitor multiple PBXs (labs1, labs2, production, etc.).

**Solution:** One WebSocket connection per PBX.

```
PBXManager → manages multiple PBX instances
WebSocketManager → maintains WebSocket per PBX
Each WebSocket tagged with pbx_id
```

---

## **📦 Data Storage Plan**

### **PostgreSQL Tables Needed:**

**1. trunk_events** (raw events)
```sql
id, pbx_id, trunk_id, event_type, status, timestamp, raw_payload
```

**2. trunk_status_history** (state changes only)
```sql
id, trunk_id, previous_state, current_state, changed_at
```

**3. call_events** (CDR summary)
```sql
id, call_id, trunk_id, caller, callee, duration, end_reason, timestamp
```

**4. event_subscriptions** (which PBX → which events)
```sql
pbx_id, event_codes[], websocket_enabled, webhook_url
```

---

## **🚀 Implementation Phases**

### **Phase 1: WebSocket Foundation (Week 1)**
- ✅ WebSocket client service
- ✅ Heartbeat mechanism
- ✅ Token refresh integration
- ✅ Subscribe to event 30010 (trunk status)

### **Phase 2: Event Processing (Week 2)**
- ✅ Event normalizer
- ✅ State tracker (in-memory)
- ✅ PostgreSQL persistence
- ✅ Emit to Gateway service

### **Phase 3: Multi-Event Support (Week 3)**
- ✅ Add events: 30011, 30012, 30023
- ✅ Event handlers per type
- ✅ Dashboard integration

### **Phase 4: Webhook Fallback (Week 4)**
- ✅ Webhook controller
- ✅ Signature verification
- ✅ Failover logic (WebSocket down → Webhook active)

---

## **🤔 Decisions Needed from You**

1. **WebSocket only or Webhook as backup?**
   - Recommendation: WebSocket primary, Webhook for critical alerts

2. **Which events to subscribe to initially?**
   - Recommendation: Start with **30010** (trunk status) only, add others later

3. **State tracker storage?**
   - **In-memory** (fast, resets on restart) or **Redis** (persistent, survives restarts)?
   - Recommendation: Start in-memory, migrate to Redis if needed

4. **Event retention policy?**
   - How long to keep raw events in PostgreSQL? 30 days? 90 days?
   - Recommendation: 90 days for trunk events, 30 days for call events

5. **Alert thresholds?**
   - When to trigger alerts? (trunk down for 5 minutes? 3 consecutive failures?)

---

## **📝 Summary**

**What we're building:**
- WebSocket service that maintains persistent connection to Yeastar PBX
- Event processor that normalizes, deduplicates, and stores trunk/call events
- State tracker that only emits on actual state changes
- Integration with existing Gateway service for real-time dashboard updates

**Why this approach:**
- ✅ Real-time (no polling)
- ✅ Scalable (multi-PBX ready)
- ✅ Reliable (auto-reconnect + heartbeat)
- ✅ Clean architecture (separated concerns)

---
