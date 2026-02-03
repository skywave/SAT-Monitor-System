# SAT Monitor – System Environment & Deployment Technical Report

**Project:** SAT Monitor – Yeastar PBX Trunk & Network Monitoring
**Author:** Intern Team / Skywave Technologies
**Date:** February 3, 2026
**Status:** Planning / Environment Specification

---

## 1. Purpose

This document provides a **comprehensive, technical description of the system environment** required to deploy and operate the SAT Monitor. It includes:

* Hardware and virtual infrastructure specifications
* Software stack requirements
* Network and PBX integration
* User access & authentication
* Security best practices
* Step-by-step setup and deployment considerations

The goal is to ensure **reliable, low-latency, secure operation** of the monitoring system with **event-driven architecture**.

---

## 2. System Architecture Overview

The SAT Monitor environment is composed of three main layers, each deployed on the same VM (or separate VMs in advanced setups):

1. **Collector Service** – AMI listener + ICMP monitoring
2. **Realtime Gateway** – WebSocket server distributing state changes
3. **Dashboard (Next.js)** – UI for trunk status, latency metrics, and history

Additional services: PostgreSQL for storage, Redis for pub/sub (optional), and supporting system utilities (`fping`, Nginx).

---

## 3. Server / Host Specifications

| Requirement   | Specification                                 | Notes / Steps                                                                                    |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Host Type** | Virtual Machine or LXC Container (Proxmox VE) | Recommended: LXC for lightweight containerization; VM for isolation.                             |
| **OS**        | Ubuntu Server 22.04 LTS                       | Minimal install, no GUI. Update system packages before installation.                             |
| **CPU**       | 2–4 cores                                     | Depends on number of trunks and ping targets; more cores if >50 trunks.                          |
| **RAM**       | 4–8 GB                                        | Collector + Gateway + Next.js all in same VM; scale RAM if running multiple monitoring services. |
| **Disk**      | 20–50 GB                                      | PostgreSQL + logs are append-only; monitor disk usage with cron or Prometheus agent.             |
| **Network**   | Internal subnet access                        | VM must reach PBX IP(s) and internal admin machines; block public internet access.               |

**Setup Steps:**

1. Create Ubuntu 22.04 LTS VM in Proxmox.
2. Assign static IP in internal subnet (e.g., 192.168.x.x).
3. Allocate CPU and RAM according to above recommendations.
4. Update OS packages:

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

5. Install essential tools:

```bash
sudo apt install -y build-essential curl git ufw fail2ban htop
```

---

## 4. Software Stack Requirements

| Component             | Version                     | Purpose                                        | Setup Notes                                                                                |
| --------------------- | --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Node.js**           | 20+                         | Collector, Realtime Gateway, Next.js           | Install via NodeSource or NVM. Ensure `npm` latest.                                        |
| **PostgreSQL**        | 15+                         | Persistent storage of logs, events, and config | Setup a dedicated DB user; enable `pg_hba.conf` for internal IPs only.                     |
| **Redis**             | 7+ (optional)               | Pub/Sub for state change events                | Only if using event distribution via Redis; bind to localhost or internal subnet.          |
| **WebSocket library** | Socket.io                   | Push real-time updates to dashboard            | Installed via `npm` in Gateway service.                                                    |
| **Task Scheduler**    | Node-cron or systemd timers | Periodic health checks, pings, API snapshots   | Collector service handles cron jobs internally or via systemd service.                     |
| **Ping Tool**         | fping / iputils-ping        | ICMP monitoring of PBX & network               | Install with `sudo apt install fping iputils-ping`. Must allow ICMP via firewall.          |
| **Reverse Proxy**     | Nginx (optional)            | Host dashboard and SSL termination             | Recommended for future internal HTTPS dashboard; configure `proxy_pass` to Next.js server. |

**Setup Steps:**

1. Install Node.js 20+:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

2. Install PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

3. Configure PostgreSQL:

* Create DB and user:

```sql
CREATE USER satmonitor WITH PASSWORD 'strongpassword';
CREATE DATABASE satmonitor OWNER satmonitor;
```

* Allow only internal VM connections (`pg_hba.conf`).

4. Install fping:

```bash
sudo apt install -y fping
```

5. (Optional) Install Redis:

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 5. Yeastar PBX Integration

**Required credentials and endpoints:**

| Method           | Purpose                        | Notes                                                                 |
| ---------------- | ------------------------------ | --------------------------------------------------------------------- |
| AMI              | Event-driven monitoring        | Primary source of truth; credentials stored securely on collector VM. |
| Yeastar REST API | Periodic snapshot / validation | Secondary; polling every 1–5 min for configuration consistency.       |

**Setup Steps:**

1. Request AMI credentials from PBX admin.
2. Store credentials in `.env` file on VM (never in code). Example:

```env
AMI_HOST=192.168.x.x
AMI_USER=monitor
AMI_PASS=strongpassword
API_HOST=https://192.168.x.x
API_KEY=apikey
```

3. Test AMI connection via Telnet:

```bash
telnet 192.168.x.x 5038
```

4. Configure firewall to allow only collector VM → PBX (port 5038 for AMI, 80/443 for API if needed).

---

## 6. User Access & Authentication

* **Concurrent users:** 10–20 internal admins
* **Authentication:** Dashboard login via Next.js
* **RBAC:** Optional; at minimum, read-only for general staff

**Steps:**

1. Create internal user accounts in the dashboard.
2. Ensure SSL/TLS via internal CA or Nginx reverse proxy.
3. Restrict access to internal subnet only via firewall.

---

## 7. Security Best Practices

* Never expose PBX credentials outside VM
* Disable public IP access for VM
* Enable UFW and allow only necessary ports:

```bash
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 3000/tcp     # Next.js dashboard (internal)
sudo ufw allow 5038/tcp     # AMI
sudo ufw enable
```

* Enable automatic fail2ban for SSH brute-force protection
* Configure systemd services with auto-restart for collector and gateway

---

## 8. Services & Deployment Steps

**Step 1:** Collector Service

* Create systemd service: `/etc/systemd/system/collector.service`

```ini
[Unit]
Description=SAT Collector Service
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/sat-monitor/collector/index.js
Restart=always
User=satmonitor
EnvironmentFile=/opt/sat-monitor/.env
WorkingDirectory=/opt/sat-monitor/collector

[Install]
WantedBy=multi-user.target
```

* Enable & start:

```bash
sudo systemctl enable collector
sudo systemctl start collector
```

**Step 2:** Realtime Gateway

* Similar systemd service for gateway (`gateway.service`)
* Connects to collector via Redis or internal socket

**Step 3:** Next.js Dashboard

* Install dependencies: `npm install`
* Build: `npm run build`
* Start via systemd or PM2

**Step 4:** Test end-to-end

* AMI event triggers → collector → gateway → dashboard update
* ICMP monitoring logs and threshold alerts

---

## 9. Optional / Advanced Enhancements

* Prometheus + Grafana for historical metrics visualization
* Dockerized deployment for faster scaling
* SSL for internal dashboard
* Slack / Email integration for alerts

---

## 10. Conclusion

This environment specification ensures that **SAT Monitor runs reliably, securely, and deterministically**.

By following these steps, the system will:

* Survive UI or service crashes
* Detect and alert on trunk/network failures
* Store historical data for reporting and analysis
* Maintain internal security boundaries
