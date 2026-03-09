import { Controller, Get, Sse, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { MonitoringService } from './monitoring.service';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * GET /api/monitoring/status
   * Returns current status snapshot of all monitored resources
   */
  @Get('status')
  async getStatus(): Promise<any> {
    return this.monitoringService.getStatus();
  }

  /**
   * GET /api/monitoring/health
   * Simple health check
   */
  @Get('health')
  getHealth(): any {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/monitoring/dashboard
   * Serves a simple HTML dashboard
   */
  @Get('dashboard')
  getDashboard(@Res() res: Response): void {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAT Monitor - Live Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #334155;
            padding-bottom: 15px;
        }
        .header h1 {
            font-size: 28px;
            color: #60a5fa;
        }
        .uptime {
            font-size: 14px;
            color: #94a3b8;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .card {
            background: #1e293b;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #334155;
        }
        .card-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #94a3b8;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #60a5fa;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 15px;
            border-left: 4px solid #60a5fa;
            padding-left: 10px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            background: #1e293b;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #334155;
        }
        .table th {
            background: #0f172a;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: 600;
            border-bottom: 1px solid #334155;
        }
        .table td {
            padding: 12px;
            border-bottom: 1px solid #334155;
            font-size: 13px;
        }
        .table tr:last-child td {
            border-bottom: none;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-connected { background: #10b981; color: #000; }
        .status-idle { background: #6b7280; color: #fff; }
        .status-busy { background: #f59e0b; color: #000; }
        .status-failed { background: #ef4444; color: #fff; }
        .status-unreachable { background: #ef4444; color: #fff; }
        .status-registered { background: #10b981; color: #000; }
        .status-unregistered { background: #6b7280; color: #fff; }
        .status-available { background: #10b981; color: #000; }
        .status-busy { background: #f59e0b; color: #000; }
        .status-paused { background: #8b5cf6; color: #fff; }
        .empty {
            text-align: center;
            padding: 40px;
            color: #64748b;
        }
        .refresh-info {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e293b;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 12px;
            border: 1px solid #334155;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🔴 SAT Monitor - Live Dashboard</h1>
            <p class="uptime" id="uptime">Loading...</p>
        </div>
        <div style="text-align: right;">
            <small style="color: #94a3b8;">Last updated: <span id="lastUpdate">--:--:--</span></small>
        </div>
    </div>

    <div class="summary">
        <div class="card">
            <div class="card-title">Connected PBX</div>
            <div class="card-value" id="pbxCount">0</div>
        </div>
        <div class="card">
            <div class="card-title">Trunks Tracked</div>
            <div class="card-value" id="trunkCount">0</div>
        </div>
        <div class="card">
            <div class="card-title">Extensions</div>
            <div class="card-value" id="extCount">0</div>
        </div>
        <div class="card">
            <div class="card-title">Active Calls</div>
            <div class="card-value" id="callCount">0</div>
        </div>
        <div class="card">
            <div class="card-title">Agents Online</div>
            <div class="card-value" id="agentCount">0</div>
        </div>
        <div class="card">
            <div class="card-title">Avg Latency</div>
            <div class="card-value" id="latency">0ms</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📡 PBX Instances</div>
        <table class="table" id="pbxTable">
            <thead>
                <tr>
                    <th>PBX ID</th>
                    <th>Host</th>
                    <th>Status</th>
                    <th>WebSocket</th>
                    <th>Uptime</th>
                    <th>Events Subscribed</th>
                    <th>Latency</th>
                </tr>
            </thead>
            <tbody id="pbxBody">
                <tr><td colspan="7" class="empty">Loading...</td></tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">🔌 Trunks</div>
        <table class="table" id="trunkTable">
            <thead>
                <tr>
                    <th>Trunk Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Registered IP</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody id="trunkBody">
                <tr><td colspan="5" class="empty">No trunks tracked</td></tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">☎️ Extensions</div>
        <table class="table" id="extTable">
            <thead>
                <tr>
                    <th>Extension</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody id="extBody">
                <tr><td colspan="5" class="empty">No extensions tracked</td></tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">📞 Active Calls</div>
        <table class="table" id="callTable">
            <thead>
                <tr>
                    <th>Call ID</th>
                    <th>Duration</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody id="callBody">
                <tr><td colspan="5" class="empty">No active calls</td></tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">👤 Agents</div>
        <table class="table" id="agentTable">
            <thead>
                <tr>
                    <th>Agent ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Queue</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody id="agentBody">
                <tr><td colspan="5" class="empty">No agents tracked</td></tr>
            </tbody>
        </table>
    </div>

    <div class="refresh-info">
        Auto-refreshing every 2 seconds
    </div>

    <script>
        async function updateDashboard() {
            try {
                const response = await fetch('/api/monitoring/status');
                const data = await response.json();

                // Update summary cards
                document.getElementById('pbxCount').textContent = data.summary.total_pbx_connections;
                document.getElementById('trunkCount').textContent = data.summary.total_trunks_tracked;
                document.getElementById('extCount').textContent = data.summary.total_extensions_tracked;
                document.getElementById('callCount').textContent = data.summary.total_calls_active;
                document.getElementById('agentCount').textContent = data.summary.total_agents_tracked || 0;
                document.getElementById('latency').textContent = (data.average_latency || 0) + 'ms';
                document.getElementById('uptime').textContent = 'Uptime: ' + formatUptime(data.uptime_seconds);
                document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();

                // Update PBX table
                updatePBXTable(data.pbx_instances);
                // Update Trunk table
                updateTrunkTable(data.trunks);
                // Update Extension table
                updateExtensionTable(data.extensions);
                // Update Call table
                updateCallTable(data.calls);
                // Update Agent table
                updateAgentTable(data.agents);
            } catch (error) {
                console.error('Failed to update dashboard:', error);
            }
        }

        function updatePBXTable(pbxes) {
            const body = document.getElementById('pbxBody');
            if (!pbxes || pbxes.length === 0) {
                body.innerHTML = '<tr><td colspan="7" class="empty">No PBX instances</td></tr>';
                return;
            }

            body.innerHTML = pbxes.map(pbx => \`
                <tr>
                    <td><strong>\${pbx.pbx_id}</strong></td>
                    <td>\${pbx.host}</td>
                    <td><span class="status-badge status-\${pbx.status}">\${pbx.status}</span></td>
                    <td><span class="status-badge status-\${pbx.websocket_status}">\${pbx.websocket_status}</span></td>
                    <td>\${formatUptime(pbx.uptime_seconds)}</td>
                    <td>\${pbx.subscribed_events.length} events</td>
                    <td>\${pbx.event_latency_ms}ms</td>
                </tr>
            \`).join('');
        }

        function updateTrunkTable(trunks) {
            const body = document.getElementById('trunkBody');
            if (!trunks || trunks.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="empty">No trunks tracked</td></tr>';
                return;
            }

            body.innerHTML = trunks.map(trunk => \`
                <tr>
                    <td><strong>\${trunk.trunk_name}</strong></td>
                    <td>\${trunk.type}</td>
                    <td><span class="status-badge status-\${trunk.status_text}">\${trunk.status_text}</span></td>
                    <td><code>\${trunk.registered_ip || 'N/A'}</code></td>
                    <td>\${formatTime(trunk.last_updated)}</td>
                </tr>
            \`).join('');
        }

        function updateExtensionTable(exts) {
            const body = document.getElementById('extBody');
            if (!exts || exts.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="empty">No extensions tracked</td></tr>';
                return;
            }

            body.innerHTML = exts.map(ext => \`
                <tr>
                    <td><strong>\${ext.ext_id}</strong></td>
                    <td>\${ext.ext_name}</td>
                    <td><span class="status-badge status-\${ext.registration_text}">\${ext.registration_text}</span></td>
                    <td><code>\${ext.ip || 'N/A'}</code></td>
                    <td>\${formatTime(ext.last_updated)}</td>
                </tr>
            \`).join('');
        }

        function updateCallTable(calls) {
            const body = document.getElementById('callBody');
            if (!calls || calls.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="empty">No active calls</td></tr>';
                return;
            }

            body.innerHTML = calls.map(call => \`
                <tr>
                    <td><strong>\${call.call_id}</strong></td>
                    <td>\${call.duration_seconds}s</td>
                    <td>\${call.members.length} members</td>
                    <td><span class="status-badge">Active</span></td>
                    <td>\${formatTime(call.last_updated)}</td>
                </tr>
            \`).join('');
        }

        function updateAgentTable(agents) {
            const body = document.getElementById('agentBody');
            if (!agents || agents.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="empty">No agents tracked</td></tr>';
                return;
            }

            body.innerHTML = agents.map(agent => \`
                <tr>
                    <td><strong>\${agent.agent_id}</strong></td>
                    <td>\${agent.agent_name}</td>
                    <td><span class="status-badge status-\${agent.status_text}">\${agent.status_text}</span></td>
                    <td>\${agent.queue_id || 'N/A'}</td>
                    <td>\${formatTime(agent.last_updated)}</td>
                </tr>
            \`).join('');
        }

        function formatUptime(seconds) {
            if (!seconds) return '0s';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hours > 0) return \`\${hours}h \${minutes}m\`;
            if (minutes > 0) return \`\${minutes}m \${secs}s\`;
            return \`\${secs}s\`;
        }

        function formatTime(isoString) {
            const date = new Date(isoString);
            return date.toLocaleTimeString();
        }

        // Initial load
        updateDashboard();
        // Auto-refresh every 2 seconds
        setInterval(updateDashboard, 2000);
    </script>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
