import blessed from 'blessed';
import axios from 'axios';

export async function startDashboard(): Promise<void> {
  const screen = blessed.screen({ smartCSR: true, title: 'SAT Monitor Dashboard' });

  const systemBox = blessed.box({
    top: 0,
    left: 'center',
    width: '100%',
    height: 4,
    tags: true,
    border: { type: 'line' },
    style: { border: { fg: 'cyan' } },
  });

  const networkTable = blessed.listtable({
    top: 4,
    left: 0,
    width: '100%',
    height: 8,
    tags: true,
    align: 'left',
    keys: true,
    vi: true,
    border: { type: 'line' },
    style: { header: { fg: 'yellow' }, border: { fg: 'magenta' } },
  });

  const trunksBox = blessed.box({
    top: 12,
    left: '0%',
    width: '50%',
    height: 9,
    tags: true,
    label: 'Trunks',
    border: { type: 'line' },
    style: { border: { fg: 'white' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
  });

  const extensionsBox = blessed.box({
    top: 12,
    left: '50%',
    width: '50%',
    height: 9,
    tags: true,
    label: 'Extensions',
    border: { type: 'line' },
    style: { border: { fg: 'white' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
  });

  const callsBox = blessed.box({
    top: 21,
    left: '0%',
    width: '50%',
    height: 9,
    tags: true,
    label: 'Calls',
    border: { type: 'line' },
    style: { border: { fg: 'white' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
  });

  const eventsBox = blessed.box({
    top: 21,
    left: '50%',
    width: '50%',
    height: 9,
    tags: true,
    label: 'Events',
    border: { type: 'line' },
    style: { border: { fg: 'white' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
  });

  const footer = blessed.box({
    bottom: 0,
    left: 'center',
    width: '100%',
    height: 1,
    tags: true,
    style: { fg: 'grey' },
    content: "Keys: 'q' quit  |  'r' refresh",
  });

  screen.append(systemBox);
  screen.append(networkTable);
  screen.append(trunksBox);
  screen.append(extensionsBox);
  screen.append(callsBox);
  screen.append(eventsBox);
  screen.append(footer);

  let refreshTimer: NodeJS.Timeout | null = null;

  async function fetchData() {
    try {
      const res = await axios.get('http://localhost:3000/api/monitoring/status', { timeout: 3000 });
      return res.data;
    } catch (err: any) {
      return { error: true, message: err.message };
    }
  }

  function colorStatus(status: string | boolean | undefined) {
    const up = typeof status === 'string' ? /up|online|connected/i.test(status) : !!status;
    return up ? '{green-fg}UP{/}' : '{red-fg}DOWN{/}';
  }

  function render(data: any) {
    if (!data || data.error) {
      systemBox.setContent(`{red-fg}Error fetching data: ${data?.message || 'no response'}{/}`);
      networkTable.setData([['Host', 'Status', 'Latency']]);
      trunksBox.setContent('');
      extensionsBox.setContent('');
      callsBox.setContent('');
      eventsBox.setContent('');
      screen.render();
      return;
    }

    // System summary
    const uptime = data.uptime_seconds ?? 'N/A';
    const pbx = (data.pbx_instances && data.pbx_instances[0]) || {};
    const pbxStatus = pbx.status ?? 'unknown';
    systemBox.setContent(`Uptime: ${uptime}s\nPBX: ${pbx.host || 'N/A'} - ${colorStatus(pbxStatus)}`);

    // Network table
    const network = Array.isArray(data.network) ? data.network : [];
    const tableRows = [['Host', 'Status', 'Latency (ms)']];
    for (const n of network) {
      tableRows.push([
        String(n.host ?? 'unknown'),
        (n.status ? String(n.status) : (n.isReachable ? 'up' : 'down')) || 'unknown',
        n.latencyMs == null ? '-' : String(n.latencyMs),
      ]);
    }
    networkTable.setData(tableRows);

    // Trunks
    const trunks = Array.isArray(data.trunks) ? data.trunks : [];
    if (trunks.length === 0) {
      trunksBox.setContent('No trunks available');
    } else {
      const lines = trunks.slice(0, 100).map((t: any) => {
        const name = t.trunk_name || t.name || t.trunk_id || 'unknown';
        const st = t.status || t.status_text || (t.registered ? 'online' : 'offline');
        return `${name} - ${colorStatus(st)}`;
      });
      trunksBox.setContent(lines.join('\n'));
    }

    // Extensions
    const exts = Array.isArray(data.extensions) ? data.extensions : [];
    if (exts.length === 0) {
      extensionsBox.setContent('No extensions available');
    } else {
      const lines = exts.slice(0, 100).map((e: any) => {
        const id = e.ext_id || e.number || e.ext || e.id || 'unknown';
        const name = e.ext_name || e.caller_id_name || '';
        const st = e.registration_text || (e.registration_status === 1 ? 'online' : 'offline');
        return `${id} ${name ? '- ' + name : ''} - ${colorStatus(st)}`;
      });
      extensionsBox.setContent(lines.join('\n'));
    }

    // Calls
    const calls = Array.isArray(data.calls) ? data.calls : [];
    if (calls.length === 0) {
      callsBox.setContent('No active calls');
    } else {
      const lines = calls.slice(0, 100).map((c: any) => {
        const id = c.call_id || c.id || c.uuid || 'call';
        const participants = (c.members || []).map((m: any) => m.extension?.number || m.inbound?.number || m.number || m).join(', ');
        return `${id} - ${participants}`;
      });
      callsBox.setContent(lines.join('\n'));
    }

    // Events
    const events = Array.isArray(data.events) ? data.events : [];
    if (events.length === 0) {
      eventsBox.setContent('No recent events');
    } else {
      const lines = events.slice(0, 100).map((ev: any) => {
        const t = ev.event_type || ev.type || JSON.stringify(ev).slice(0, 40);
        return `${t}`;
      });
      eventsBox.setContent(lines.join('\n'));
    }

    screen.render();
  }

  let running = true;

  async function fetchAndRender() {
    const data = await fetchData();
    render(data);
  }

  // Initial draw
  await fetchAndRender();

  // Auto-refresh every 2s
  refreshTimer = setInterval(() => {
    if (!running) return;
    fetchAndRender().catch(() => {});
  }, 2000);

  // Keys
  screen.key(['q', 'C-c'], () => {
    running = false;
    if (refreshTimer) clearInterval(refreshTimer);
    process.exit(0);
  });

  screen.key(['r'], () => {
    fetchAndRender().catch(() => {});
  });

  screen.render();
}
