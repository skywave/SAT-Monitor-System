import React, { useState, useEffect } from 'react';
import './notification.css';
import { notificationApi } from '../../../../services/notificationApi';

// ── Alert History Tab ─────────────────────────────────────────────────────────
function AlertHistory() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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
        setError('Could not reach the notifications API — ' + (historyRes.reason?.message || 'check your backend is running'));
      }
    } finally {
      setLoading(false);
    }
  }

  function severityClass(s) {
    if (s === 'CRITICAL') return 'badge-red';
    if (s === 'WARNING')  return 'badge-orange';
    if (s === 'OK')       return 'badge-green';
    return 'badge-grey';
  }

  function alertTypeLabel(type) {
    const labels = {
      problem:             'Trunk Down',
      recovery:            'Trunk Recovered',
      ip_unreachable:      'IP Unreachable',
      ip_recovered:        'IP Recovered',
      threshold_above_max: 'Threshold Exceeded',
      threshold_below_min: 'Threshold Below Min',
    };
    return labels[type] || type;
  }

  function statusLabel(alertType, status) {
    if (status) return status;
    if (alertType === 'recovery')       return 'Registered';
    if (alertType === 'ip_recovered')   return 'Reachable';
    if (alertType === 'ip_unreachable') return 'Unreachable';
    if (alertType === 'threshold_above_max') return 'Exceeded';
    if (alertType === 'threshold_below_min') return 'Below Min';
    if (alertType === 'problem')             return 'Down';
    return '—';
  }

  function statusClass(alertType, status) {
    if (alertType === 'threshold_above_max') return 'badge-orange';
    if (alertType === 'threshold_below_min') return 'badge-orange';
    const val = (status || '').toLowerCase();
    if (val === 'registered' || alertType === 'recovery' || alertType === 'ip_recovered') return 'badge-green';
    if (val.includes('failed') || val.includes('unreachable') || alertType === 'problem') return 'badge-red';
    if (val.includes('disabled') || val.includes('unavailable')) return 'badge-orange';
    return 'badge-grey';
  }

  return (
    <div>
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card__value">{summary.total ?? '—'}</div>
            <div className="summary-card__label">Total Alerts</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__value">{summary.last24h ?? '—'}</div>
            <div className="summary-card__label">Last 24 Hours</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__value">{summary.bySeverity?.CRITICAL ?? 0}</div>
            <div className="summary-card__label">Critical</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__value">{summary.bySeverity?.WARNING ?? 0}</div>
            <div className="summary-card__label">Warnings</div>
          </div>
        </div>
      )}

      {loading && <div className="state-box">Loading alerts...</div>}

      {!loading && error && (
        <div className="state-box state-box--error">
          <div style={{ marginBottom: '0.5rem' }}>⚠ {error}</div>
          <button className="btn btn-sm btn-secondary" onClick={loadData}>Retry</button>
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="state-box">
          No alerts sent yet. Alerts appear here automatically when your backend fires them.
        </div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th><th>Trunk</th><th>Type</th><th>Severity</th><th>Status</th><th>Message</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td className="td-time">{new Date(a.sent_at).toLocaleString()}</td>
                <td>{a.trunk_name}</td>
                <td>{alertTypeLabel(a.alert_type)}</td>
                <td><span className={`badge ${severityClass(a.severity)}`}>{a.severity}</span></td>
                <td><span className={`badge ${statusClass(a.alert_type, a.status)}`}>{statusLabel(a.alert_type, a.status)}</span></td>
                <td className="td-message">{a.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Recipients Tab ────────────────────────────────────────────────────────────
function RecipientsTab() {
  const [recipients, setRecipients] = useState([]);
  const [trunks, setTrunks]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [form, setForm]             = useState({ name: '', email: '', trunk_id: 'all', enabled: true });
  const [formError, setFormError]   = useState('');
  const [toast, setToast]           = useState(null);

  useEffect(() => { loadRecipients(); loadTrunks(); }, []);

  async function loadRecipients() {
    setLoading(true);
    try {
      const res = await notificationApi.getRecipients();
      setRecipients(res.recipients || []);
    } catch (err) {
      showToast(err.message || 'Failed to load recipients', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadTrunks() {
    try {
      const res = await notificationApi.getTrunks();
      setTrunks(res.trunks || []);
    } catch {}
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', email: '', trunk_id: 'all', enabled: true });
    setFormError('');
    setShowForm(true);
  }

  function openEdit(r) {
    setEditing(r);
    setForm({ name: r.name, email: r.email, trunk_id: r.trunk_id, enabled: r.enabled });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditing(null); setFormError(''); }

  async function saveRecipient() {
    if (!form.name || !form.email) { setFormError('Name and email are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await notificationApi.updateRecipient(editing.id, form);
        showToast('Recipient updated', 'success');
      } else {
        await notificationApi.addRecipient(form);
        showToast('Recipient added', 'success');
      }
      closeForm();
      loadRecipients();
    } catch (err) {
      setFormError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(r) {
    try {
      await notificationApi.updateRecipient(r.id, { enabled: !r.enabled });
      showToast(r.enabled ? 'Disabled' : 'Enabled', 'success');
      loadRecipients();
    } catch (err) { showToast(err.message || 'Failed to update', 'error'); }
  }

  async function confirmDelete() {
    setSaving(true);
    try {
      await notificationApi.deleteRecipient(deleting.id);
      showToast('Recipient removed', 'success');
      setDeleting(null);
      loadRecipients();
    } catch (err) { showToast(err.message || 'Failed to remove', 'error'); }
    finally { setSaving(false); }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div>
      <div className="tab-toolbar">
        <p className="tab-desc">Manage who receives alert emails. Set scope to a specific trunk or all trunks.</p>
        <button className="btn btn-grey" onClick={openAdd}>+ Add Recipient</button>
      </div>

      {loading && <div className="state-box">Loading...</div>}
      {!loading && recipients.length === 0 && (
        <div className="state-box">No recipients yet. Add one to start receiving alerts.</div>
      )}
      {!loading && recipients.length > 0 && (
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Scope</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {recipients.map(r => (
              <tr key={r.id} className={!r.enabled ? 'row-disabled' : ''}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>
                  <span className={`badge ${r.trunk_id === 'all' ? 'badge-blue' : 'badge-grey'}`}>
                    {r.trunk_id === 'all' ? 'All Trunks' : r.trunk_id}
                  </span>
                </td>
                <td>
                  <span className={`badge ${r.enabled ? 'badge-green' : 'badge-red'}`}>
                    {r.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>Edit</button>
                  <button className={`btn btn-sm ${r.enabled ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleEnabled(r)}>
                    {r.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleting(r)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && closeForm()}>
          <div className="modal">
            <h3>{editing ? 'Edit Recipient' : 'Add Recipient'}</h3>
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input type="text" placeholder="e.g. IT Admin" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" placeholder="admin@company.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Trunk Scope</label>
              <select value={form.trunk_id} onChange={e => setForm({ ...form, trunk_id: e.target.value })}>
                <option value="all">All Trunks — receives every alert</option>
                {trunks.map(t => <option key={t.trunk_id} value={t.name}>{t.name} only</option>)}
              </select>
              <small className="hint">"All Trunks" means this person gets alerted for any trunk problem.</small>
            </div>
            <div className="form-group form-group-inline">
              <input type="checkbox" id="enabled-chk" checked={form.enabled}
                onChange={e => setForm({ ...form, enabled: e.target.checked })} />
              <label htmlFor="enabled-chk">Active</label>
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveRecipient}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Recipient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setDeleting(null)}>
          <div className="modal modal-sm">
            <h3>Remove Recipient</h3>
            <p>Remove <strong>{deleting.name}</strong> ({deleting.email})?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={saving} onClick={confirmDelete}>
                {saving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

// ── Thresholds Tab ────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  failed_calls_max: 5, no_answer_max: 10, rejected_max: 5,
  concurrent_calls_max: 50, latency_max: 150, bandwidth_max: 10000,
  metrics_window_minutes: 60, consecutive_failures: 2, cooldown_minutes: 30,
};

function ThresholdsTab() {
  const [trunks, setTrunks]               = useState([]);
  const [selectedTrunk, setSelectedTrunk] = useState('');
  const [manualTrunk, setManualTrunk]     = useState('');
  const [trunksError, setTrunksError]     = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [customConfigs, setCustomConfigs] = useState({});
  const [saving, setSaving]               = useState(false);
  const [loading, setLoading]             = useState(false);
  const [loadingPanel, setLoadingPanel]   = useState(false);
  const [saveError, setSaveError]         = useState('');
  const [toast, setToast]                 = useState(null);
  const [form, setForm]                   = useState(DEFAULT_FORM);

  useEffect(() => { loadInitial(); }, []);

  async function loadInitial() {
    setLoading(true);
    try {
      const [trunkRes, thresholdRes] = await Promise.allSettled([
        notificationApi.getTrunks(),
        notificationApi.getAllThresholds(),
      ]);

      if (trunkRes.status === 'fulfilled') {
        const trunkList = trunkRes.value.trunks || [];
        setTrunks(trunkList);
        if (trunkList.length > 0) {
          setSelectedTrunk(trunkList[0].name);
          await loadTrunkPanel(trunkList[0].name);
        }
      } else {
        setTrunksError(true);
      }

      if (thresholdRes.status === 'fulfilled') {
        const configMap = {};
        (thresholdRes.value.thresholds || []).forEach(t => { configMap[t.trunk_id] = t; });
        setCustomConfigs(configMap);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadTrunkPanel(name) {
    if (!name) return;
    setLoadingPanel(true);
    setSaveError('');
    try {
      const res = await notificationApi.getTrunkThresholds(name);
      setCurrentConfig(res);
      const t = res.thresholds || {};
      setForm({
        failed_calls_max:       t.failed_calls_max       ?? 5,
        no_answer_max:          t.no_answer_max          ?? 10,
        rejected_max:           t.rejected_max           ?? 5,
        concurrent_calls_max:   t.concurrent_calls_max   ?? 50,
        latency_max:            t.latency_max            ?? 150,
        bandwidth_max:          t.bandwidth_max          ?? 10000,
        metrics_window_minutes: t.metrics_window_minutes ?? 60,
        consecutive_failures:   t.consecutive_failures   ?? 2,
        cooldown_minutes:       t.cooldown_minutes       ?? 30,
      });
    } catch {
      setCurrentConfig({ isDefault: true, thresholds: DEFAULT_FORM });
      setForm(DEFAULT_FORM);
    } finally {
      setLoadingPanel(false);
    }
  }

  async function handleSelectTrunk(name) {
    setSelectedTrunk(name);
    await loadTrunkPanel(name);
  }

  async function handleManualLoad() {
    const name = manualTrunk.trim();
    if (!name) return;
    setSelectedTrunk(name);
    await loadTrunkPanel(name);
  }

  async function saveThresholds() {
    if (!selectedTrunk) { setSaveError('Select or enter a trunk name first'); return; }
    setSaving(true); setSaveError('');
    try {
      await notificationApi.updateTrunkThresholds(selectedTrunk, { trunk_name: selectedTrunk, ...form });
      setCustomConfigs(prev => ({ ...prev, [selectedTrunk]: true }));
      setCurrentConfig(prev => ({ ...prev, isDefault: false }));
      showToast('Thresholds saved for ' + selectedTrunk, 'success');
    } catch (err) {
      setSaveError(err.message || 'Failed to save thresholds');
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefaults() {
    setSaving(true);
    try {
      await notificationApi.resetTrunkThresholds(selectedTrunk);
      setCustomConfigs(prev => { const n = { ...prev }; delete n[selectedTrunk]; return n; });
      setForm(DEFAULT_FORM);
      setCurrentConfig(prev => ({ ...prev, isDefault: true }));
      showToast('Reset to defaults', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reset', 'error');
    } finally {
      setSaving(false);
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function Field({ label, hint, field, unit }) {
    return (
      <div className="setting-item">
        <label>{label}</label>
        <small>{hint}</small>
        <div className="input-row">
          <input
            type="number"
            min="0"
            value={form[field]}
            onChange={e => setForm(prev => ({ ...prev, [field]: parseInt(e.target.value) || 0 }))}
          />
          <span className="unit">{unit}</span>
        </div>
      </div>
    );
  }

  if (loading) return <div className="state-box">Loading trunk data...</div>;

  return (
    <div>
      <p className="tab-desc">Set custom alert thresholds per trunk. Trunks without custom settings use system defaults.</p>

      {!trunksError && trunks.length > 0 && (
        <div className="trunk-tabs">
          {trunks.map(t => (
            <button
              key={t.trunk_id}
              className={`trunk-tab ${selectedTrunk === t.name ? 'active' : ''}`}
              onClick={() => handleSelectTrunk(t.name)}
            >
              {t.name}
              {customConfigs[t.name] && <span className="custom-dot"> ●</span>}
            </button>
          ))}
        </div>
      )}

      {(trunksError || trunks.length === 0) && (
        <div className="manual-trunk-row">
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Trunk name</label>
            <input
              type="text"
              placeholder="e.g. SBC-Primary"
              value={manualTrunk}
              onChange={e => setManualTrunk(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualLoad()}
            />
          </div>
          <button className="btn btn-secondary" style={{ alignSelf: 'flex-end' }} onClick={handleManualLoad}>
            Load
          </button>
          {trunksError && (
            <small className="hint" style={{ width: '100%' }}>
              Could not load trunk list — enter a trunk name manually to configure its thresholds.
            </small>
          )}
        </div>
      )}

      {loadingPanel && <div className="state-box" style={{ marginTop: '1rem' }}>Loading thresholds...</div>}

      {!loadingPanel && selectedTrunk && (
        <div className="settings-panel">
          <div className="settings-header">
            <div>
              <h3>{selectedTrunk}</h3>
              <span className={`badge ${currentConfig?.isDefault ? 'badge-grey' : 'badge-blue'}`}>
                {currentConfig?.isDefault ? 'Using system defaults' : 'Custom configuration'}
              </span>
            </div>
            {!currentConfig?.isDefault && (
              <button className="btn btn-secondary btn-sm" onClick={resetToDefaults} disabled={saving}>
                Reset to Defaults
              </button>
            )}
          </div>

          <div className="settings-section">
            <h4>Call Metrics</h4>
            <div className="settings-grid">
              <Field label="Failed Calls Max"     hint="Alert when failed calls exceed this"       field="failed_calls_max"     unit="calls" />
              <Field label="No Answer Max"        hint="Alert when unanswered calls exceed this"   field="no_answer_max"        unit="calls" />
              <Field label="Rejected Calls Max"   hint="Alert when rejected calls exceed this"     field="rejected_max"         unit="calls" />
              <Field label="Concurrent Calls Max" hint="Alert when simultaneous calls exceed this" field="concurrent_calls_max" unit="calls" />
            </div>
          </div>

          <div className="settings-section">
            <h4>Network Metrics</h4>
            <div className="settings-grid">
              <Field label="Latency Max"   hint="Alert when average latency exceeds this" field="latency_max"   unit="ms"   />
              <Field label="Bandwidth Max" hint="Alert when bandwidth exceeds this"       field="bandwidth_max" unit="kbps" />
            </div>
          </div>

          <div className="settings-section">
            <h4>Alert Behaviour</h4>
            <div className="settings-grid">
              <Field label="Metrics Window"       hint="How far back to count calls"                  field="metrics_window_minutes" unit="minutes" />
              <Field label="Consecutive Failures" hint="How many failed polls before alerting"        field="consecutive_failures"   unit="polls"   />
              <Field label="Cooldown Period"      hint="Minutes between repeat alerts for same issue" field="cooldown_minutes"       unit="minutes" />
            </div>
          </div>

          <div className="severity-info">
            <div className="severity-item severity-warning"><strong>WARNING</strong> — metric exceeds the limit</div>
            <div className="severity-item severity-critical"><strong>CRITICAL</strong> — metric exceeds 1.5× the limit</div>
          </div>

          {saveError && <div className="form-error">{saveError}</div>}
          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving} onClick={saveThresholds}>
              {saving ? 'Saving...' : 'Save Thresholds'}
            </button>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}


// ── Engine Controls (Toggle + Force Poll) ─────────────────────────────────────
function EngineToggle() {
  const [running, setRunning]   = useState(null);
  const [toggling, setToggling] = useState(false);
  const [polling, setPolling]   = useState(false);
  const [pollDone, setPollDone] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    try {
      const res = await notificationApi.getEngineStatus();
      setRunning(res.running);
    } catch {
      setRunning(false);
    }
  }

  async function toggle() {
    setToggling(true);
    try {
      if (running) {
        await notificationApi.stopEngine();
      } else {
        await notificationApi.startEngine();
      }
      await loadStatus();
    } catch {} finally {
      setToggling(false);
    }
  }

  async function forcePoll() {
    setPolling(true);
    setPollDone(false);
    try {
      await notificationApi.forcePoll();
      setPollDone(true);
      setTimeout(() => setPollDone(false), 2000);
    } catch {} finally {
      setPolling(false);
    }
  }

  return (
    <div className="engine-controls">
      <div className="engine-toggle">
        <div className="engine-status">
          <span className={`engine-dot ${running ? 'engine-dot--on' : 'engine-dot--off'}`} />
          {running === null ? 'Checking...' : running ? 'Running' : 'Stopped'}
        </div>
        <button className="btn btn-sm btn-secondary" onClick={toggle} disabled={toggling || running === null}>
          {toggling ? '...' : running ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="engine-divider" />

      <button
        className="btn btn-sm btn-secondary"
        onClick={forcePoll}
        disabled={polling}
        title="Immediately run one full poll cycle — checks trunk status, IP reachability, and CDR metrics right now"
      >
        {polling ? 'Polling...' : pollDone ? '✓ Done' : 'Force Poll'}
      </button>
    </div>
  );
}

// ── Main Notifications Page ───────────────────────────────────────────────────
export default function Notifications() {
  const [activeTab, setActiveTab] = useState('history');

  const tabs = [
    { key: 'history',    label: 'Alert History' },
    { key: 'recipients', label: 'Recipients'     },
    { key: 'thresholds', label: 'Thresholds'     },
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">Monitor alerts, manage recipients, and configure thresholds</p>
        </div>
        <EngineToggle />
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'history'    && <AlertHistory />}
        {activeTab === 'recipients' && <RecipientsTab />}
        {activeTab === 'thresholds' && <ThresholdsTab />}
      </div>
    </div>
  );
}