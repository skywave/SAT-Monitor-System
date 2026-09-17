import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Clock, Plus, RefreshCw, X } from 'lucide-react';
import { notificationApi } from '../../../../services/notificationApi';

const Badge = ({ children, tone = 'zinc' }) => {
  const tones = {
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${tones[tone]}`}>{children}</span>;
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#111] border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

function AlertHistory() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, historyRes] = await Promise.allSettled([
        notificationApi.getSummary(),
        notificationApi.getHistory(50),
      ]);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (historyRes.status === 'fulfilled') setAlerts(historyRes.value.alerts || []);
      if (summaryRes.status === 'rejected' && historyRes.status === 'rejected') {
        setError(historyRes.reason?.message || 'Notifications API unreachable');
      }
    } finally {
      setLoading(false);
    }
  }

  const severityTone = (s) => s === 'CRITICAL' ? 'red' : s === 'WARNING' ? 'amber' : 'green';

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts', val: summary.total },
            { label: 'Last 24h', val: summary.last24h },
            { label: 'Critical', val: summary.bySeverity?.CRITICAL },
            { label: 'Warnings', val: summary.bySeverity?.WARNING }
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
              <p className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold">{s.label}</p>
              <h4 className="text-2xl font-bold mt-1 tabular-nums">{s.val ?? 0}</h4>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-sm text-zinc-500">Loading alerts...</p>}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="text-xs uppercase tracking-widest">Retry</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0A0A0A]">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              {['Time', 'Trunk', 'Type', 'Severity', 'Status'].map((h) => (
                <th key={h} className="p-4 text-[10px] uppercase text-zinc-500 tracking-widest font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {alerts.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-900/30">
                <td className="p-4 text-zinc-400 font-mono text-xs">{new Date(a.sent_at).toLocaleString()}</td>
                <td className="p-4 font-medium">{a.trunk_name}</td>
                <td className="p-4 text-zinc-400">{a.alert_type}</td>
                <td className="p-4"><Badge tone={severityTone(a.severity)}>{a.severity}</Badge></td>
                <td className="p-4 text-zinc-400">{a.status || '—'}</td>
              </tr>
            ))}
            {!loading && alerts.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-zinc-500">No alerts recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipientsTab() {
  const [recipients, setRecipients] = useState([]);
  const [trunks, setTrunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', trunk_id: 'all', enabled: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRecipients(); loadTrunks(); }, []);

  async function loadRecipients() {
    setLoading(true);
    try {
      const res = await notificationApi.getRecipients();
      setRecipients(res.recipients || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function loadTrunks() {
    try {
      const res = await notificationApi.getTrunks();
      setTrunks(res.trunks || []);
    } catch (e) { console.error(e); }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', email: '', trunk_id: 'all', enabled: true });
    setFormError('');
    setShowForm(true);
  }

  async function saveRecipient() {
    if (!form.name || !form.email) { setFormError('Name and email are required'); return; }
    setSaving(true);
    try {
      if (editing) await notificationApi.updateRecipient(editing.id, form);
      else await notificationApi.addRecipient(form);
      setShowForm(false);
      loadRecipients();
    } catch (err) {
      setFormError(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  async function toggleEnabled(r) {
    await notificationApi.updateRecipient(r.id, { enabled: !r.enabled });
    loadRecipients();
  }

  async function remove(r) {
    await notificationApi.deleteRecipient(r.id);
    loadRecipients();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Manage who receives alert emails.</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-widest">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              {['Name', 'Email', 'Scope', 'Status', 'Actions'].map((h) => (
                <th key={h} className="p-4 text-[10px] uppercase text-zinc-500 tracking-widest font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {recipients.map((r) => (
              <tr key={r.id} className={!r.enabled ? 'opacity-50' : ''}>
                <td className="p-4 font-medium">{r.name}</td>
                <td className="p-4 text-zinc-400">{r.email}</td>
                <td className="p-4"><Badge tone={r.trunk_id === 'all' ? 'purple' : 'zinc'}>{r.trunk_id === 'all' ? 'All Trunks' : r.trunk_id}</Badge></td>
                <td className="p-4"><Badge tone={r.enabled ? 'green' : 'red'}>{r.enabled ? 'Active' : 'Disabled'}</Badge></td>
                <td className="p-4 flex gap-2">
                  <button className="text-xs text-zinc-400 hover:text-white" onClick={() => { setEditing(r); setForm({ name: r.name, email: r.email, trunk_id: r.trunk_id, enabled: r.enabled }); setShowForm(true); }}>Edit</button>
                  <button className="text-xs text-zinc-400 hover:text-white" onClick={() => toggleEnabled(r)}>{r.enabled ? 'Disable' : 'Enable'}</button>
                  <button className="text-xs text-red-400 hover:text-red-300" onClick={() => remove(r)}>Remove</button>
                </td>
              </tr>
            ))}
            {!loading && recipients.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-zinc-500">No recipients yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <Modal title={editing ? 'Edit Recipient' : 'Add Recipient'} onClose={() => setShowForm(false)}>
            <div className="space-y-4">
              <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm" value={form.trunk_id} onChange={(e) => setForm({ ...form, trunk_id: e.target.value })}>
                <option value="all">All Trunks</option>
                {trunks.map((t) => <option key={t.trunk_id} value={t.name}>{t.name}</option>)}
              </select>
              {formError && <p className="text-xs text-red-400">{formError}</p>}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-3 py-2 text-xs uppercase tracking-widest text-zinc-400">Cancel</button>
                <button onClick={saveRecipient} disabled={saving} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-xs uppercase tracking-widest">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

const DEFAULT_FORM = {
  failed_calls_max: 5, no_answer_max: 10, rejected_max: 5,
  concurrent_calls_max: 50, latency_max: 150, bandwidth_max: 10000,
  metrics_window_minutes: 60, consecutive_failures: 2, cooldown_minutes: 30,
};

function ThresholdsTab() {
  const [trunks, setTrunks] = useState([]);
  const [selectedTrunk, setSelectedTrunk] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await notificationApi.getTrunks();
        const list = res.trunks || [];
        setTrunks(list);
        if (list[0]) {
          setSelectedTrunk(list[0].name);
          loadPanel(list[0].name);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  async function loadPanel(name) {
    try {
      const res = await notificationApi.getTrunkThresholds(name);
      setForm({ ...DEFAULT_FORM, ...(res.thresholds || {}) });
    } catch {
      setForm(DEFAULT_FORM);
    }
  }

  async function save() {
    if (!selectedTrunk) return;
    setSaving(true);
    try {
      await notificationApi.updateTrunkThresholds(selectedTrunk, { trunk_name: selectedTrunk, ...form });
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  const fields = [
    ['failed_calls_max', 'Failed Calls', 'calls'],
    ['no_answer_max', 'No Answer', 'calls'],
    ['rejected_max', 'Rejected', 'calls'],
    ['concurrent_calls_max', 'Concurrent', 'calls'],
    ['latency_max', 'Latency Max', 'ms'],
    ['bandwidth_max', 'Bandwidth Max', 'kbps'],
    ['metrics_window_minutes', 'Window', 'min'],
    ['consecutive_failures', 'Failures', 'polls'],
    ['cooldown_minutes', 'Cooldown', 'min'],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {trunks.map((t) => (
          <button
            key={t.trunk_id}
            onClick={() => { setSelectedTrunk(t.name); loadPanel(t.name); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border ${selectedTrunk === t.name ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-zinc-800 text-zinc-500'}`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(([field, label, unit]) => (
          <div key={field} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</label>
            <div className="mt-2 flex items-center gap-2">
              <input type="number" min="0" value={form[field]} onChange={(e) => setForm({ ...form, [field]: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm font-mono" />
              <span className="text-xs text-zinc-500">{unit}</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving || !selectedTrunk} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-xs uppercase tracking-widest font-bold disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Thresholds'}
      </button>
    </div>
  );
}

function EngineToggle() {
  const [running, setRunning] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    try {
      const res = await notificationApi.getEngineStatus();
      setRunning(res.running);
    } catch { setRunning(false); }
  }

  async function toggle() {
    try {
      if (running) await notificationApi.stopEngine();
      else await notificationApi.startEngine();
      await loadStatus();
    } catch (e) { console.error(e); }
  }

  async function forcePoll() {
    setPolling(true);
    try { await notificationApi.forcePoll(); } catch (e) { console.error(e); }
    setPolling(false);
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <span className="text-xs text-zinc-400 uppercase tracking-widest">{running ? 'Running' : 'Stopped'}</span>
      <button onClick={toggle} className="text-xs border border-zinc-700 px-3 py-1 rounded-lg hover:bg-zinc-800">{running ? 'Stop' : 'Start'}</button>
      <button onClick={forcePoll} className="text-xs border border-zinc-700 px-3 py-1 rounded-lg hover:bg-zinc-800">{polling ? 'Polling...' : 'Force Poll'}</button>
    </div>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('history');
  const tabs = [
    { key: 'history', label: 'Alert History', icon: Clock },
    { key: 'recipients', label: 'Recipients', icon: Shield },
    { key: 'thresholds', label: 'Thresholds', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-zinc-500 text-sm">Alerts, recipients, and thresholds</p>
        </div>
        <EngineToggle />
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === tab.key ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'history' && <AlertHistory />}
        {activeTab === 'recipients' && <RecipientsTab />}
        {activeTab === 'thresholds' && <ThresholdsTab />}
      </motion.div>
    </div>
  );
}
