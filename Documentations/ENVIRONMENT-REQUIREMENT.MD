# **SAT Monitor – System Environment & Deployment (API-First)**

**Project:** SAT Monitor – Yeastar PBX Trunk & Network Monitoring
**Author:** Intern Team / Skywave Technologies
**Date:** February 3, 2026
**Status:** Planning / Environment Specification

---

## 1. Purpose

This document describes the **system environment required to deploy and operate SAT Monitor** with **vendor-compliant integration**.

Focus areas:

* Hardware & VM/container specifications
* Software stack & dependencies
* Yeastar API integration (primary) & optional AMI
* Network & user access
* Security best practices
* Step-by-step deployment

Goal: **Reliable, low-latency, secure operation** for **event-driven trunk and network monitoring**.

---

## 2. System Architecture Overview

SAT Monitor consists of **three main logical layers**, deployable on the same VM or separate VMs:

1. **Collector Service** – Primary Yeastar API connector + optional AMI adapter + ICMP monitoring
2. **Realtime Gateway** – WebSocket server for distributing state-change events
3. **Dashboard (Next.js)** – UI for trunk status, latency metrics, and historical data

Additional services: PostgreSQL (storage), Redis (optional pub/sub), system utilities (`fping`, Nginx).

---

## 3. Server / Host Specifications

| Requirement   | Specification                    | Notes / Steps                                                              |
| ------------- | -------------------------------- | -------------------------------------------------------------------------- |
| **Host Type** | VM or LXC Container (Proxmox VE) | LXC recommended for lightweight; VM for strong isolation.                  |
| **OS**        | Ubuntu Server 22.04 LTS          | Minimal install; no GUI. Update packages.                                  |
| **CPU**       | 2–4 cores                        | Scale if monitoring >50 trunks or multiple PBXs.                           |
| **RAM**       | 4–8 GB                           | Scale with number of monitoring services running.                          |
| **Disk**      | 20–50 GB                         | PostgreSQL + logs are append-only. Monitor usage.                          |
| **Network**   | Internal subnet access           | Must reach PBXs and internal admin machines; block public internet access. |

**Setup Steps:**

1. Create VM/LXC in Proxmox, assign static IP (e.g., 192.168.x.x)
2. Allocate CPU & RAM
3. Update OS:

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

4. Install essentials:

```bash
sudo apt install -y build-essential curl git ufw fail2ban htop
```

---

## 4. Software Stack Requirements

| Component             | Version                    | Purpose                              | Notes / Setup                                                    |
| --------------------- | -------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| **Node.js**           | 20+                        | Collector, Realtime Gateway, Next.js | Install via NodeSource or NVM. Ensure `npm` latest.              |
| **PostgreSQL**        | 15+                        | Logs, events, configuration storage  | Dedicated DB user; allow internal IPs only.                      |
| **Redis**             | 7+ (optional)              | Event pub/sub                        | For gateway communication; bind to localhost or internal subnet. |
| **WebSocket library** | Socket.io                  | Push real-time updates               | Installed via `npm` in Gateway service.                          |
| **Task Scheduler**    | Node-cron / systemd timers | Periodic API snapshots, ping checks  | Collector handles scheduling internally or via systemd.          |
| **Ping Tool**         | fping / iputils-ping       | ICMP monitoring                      | Install and allow ICMP in firewall.                              |
| **Reverse Proxy**     | Nginx (optional)           | Host dashboard, SSL termination      | Configure `proxy_pass` to Next.js server.                        |

---

## 5. Yeastar PBX Integration (API-First)

| Method         | Purpose                       | Notes                                                                 |
| -------------- | ----------------------------- | --------------------------------------------------------------------- |
| Yeastar API    | Primary monitoring            | Polls trunk & registration status; periodic snapshot for consistency. |
| AMI (optional) | Event-driven real-time alerts | Only if vendor grants access; integrated as optional future adapter.  |

**Setup Steps:**

1. Obtain API credentials from PBX admin.
2. Store credentials in `.env` on collector VM:

```env
API_HOST=https://192.168.x.x
API_KEY=your_api_key
AMI_HOST=192.168.x.x      # Optional
AMI_USER=monitor
AMI_PASS=strongpassword
```

3. Test API connection from collector:

```bash
curl -H "Authorization: Bearer your_api_key" https://192.168.x.x/api/status
```

4. Configure firewall: allow **collector VM → PBX** (API: 80/443, AMI: 5038 if used)

---

## 6. User Access & Authentication

* Concurrent users: 10–20 internal admins
* Dashboard login via Next.js
* RBAC optional; at minimum, read-only for general staff
* Access restricted to **internal subnet only**

---

## 7. Security Best Practices

* Never expose PBX credentials externally
* UFW firewall: allow only necessary ports

```bash
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 3000/tcp     # Dashboard
sudo ufw allow 443/tcp      # HTTPS
sudo ufw allow 5038/tcp     # AMI (optional)
sudo ufw enable
```

* Enable fail2ban
* Use systemd auto-restart for critical services
* Store secrets in `.env` (never in code)

---

## 8. Services & Deployment Steps

**Collector Service:**

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

```bash
sudo systemctl enable collector
sudo systemctl start collector
```

**Realtime Gateway** – similar systemd service, connects via Redis or socket
**Next.js Dashboard** – install deps, build, start via systemd/PM2
**End-to-end test:** API triggers → collector → gateway → dashboard update → ICMP alerts logged

---

## 9. Optional / Advanced Enhancements

* Prometheus + Grafana for metrics
* Dockerized deployment for multi-PBX scaling
* SSL for internal dashboard
* Slack / Email alert integration

---

## 10. Conclusion

* **API-first design ensures compliance and reliability**
* AMI is **optional/future**, making the system **adaptable**
* Environment supports **multi-PBX scaling** and **secure internal monitoring**
* System survives crashes, stores historical data, and maintains security boundaries

This file have been edited by Miriki
