import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Server, Phone, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../../../config/api';

const getStatus = (statusText, latency) => {
  if (['registration_failed', 'unreachable', 'down', 'disabled'].includes(statusText)) return 'down';
  if (latency && latency > 100) return 'warning';
  return 'up';
};

const getLatencyQuality = (latency) => {
  if (!latency && latency !== 0) return 'N/A';
  if (latency < 20) return 'Excellent';
  if (latency < 50) return 'Good';
  if (latency < 100) return 'Fair';
  return 'Poor';
};

const qualityClass = (q) => {
  if (q === 'Excellent') return 'text-emerald-600';
  if (q === 'Good') return 'text-blue-600';
  if (q === 'Fair') return 'text-amber-600';
  if (q === 'Poor') return 'text-red-600';
  return 'text-slate-500';
};

const StatusBadge = ({ status }) => {
  const map = {
    up: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reachable: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    down: 'bg-red-50 text-red-700 border-red-200',
    unreachable: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${map[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status === 'up' || status === 'reachable' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {status}
    </span>
  );
};

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <h3 className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 bg-slate-50">
      <Icon className="w-4 h-4 text-blue-600" /> {title}
    </h3>
    <div className="p-6">{children}</div>
  </div>
);

const NetworkMonitoring = () => {
  const [trunks, setTrunks] = useState([]);
  const [reachability, setReachability] = useState({});
  const [latency, setLatency] = useState({});
  const [callStats, setCallStats] = useState({
    trunks: {},
    customerFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 },
    mnoFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 },
    gatewayFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trunkData, net, calls] = await Promise.all([
        api.getTrunks(),
        api.getNetworkStatus(),
        api.getCallStats()
      ]);
      const trunkMap = new Map();
      (trunkData || []).forEach((trunk) => {
        if (!trunkMap.has(trunk.trunk_id)) {
          trunkMap.set(trunk.trunk_id, {
            id: trunk.trunk_id,
            name: trunk.trunk_name,
            status: getStatus(trunk.status_text, trunk.current_latency_ms),
            latency: trunk.current_latency_ms
          });
        }
      });
      setTrunks(Array.from(trunkMap.values()));
      setReachability({
        gateway: net.gateway_reachable ? 'reachable' : 'unreachable',
        nas: net.nas_reachable ? 'reachable' : 'unreachable',
        mno: net.mno_reachable ? 'reachable' : 'unreachable',
        customer: net.customer_reachable ? 'reachable' : 'unreachable',
        google: net.google_reachable ? 'reachable' : 'unreachable'
      });
      setLatency({
        gateway: net.gateway_latency || 0,
        nas: net.nas_latency || 0,
        customer: net.customer_latency || 0,
        google: net.google_latency || 0
      });
      setCallStats({
        trunks: calls.trunks || {},
        customerFacing: calls.customerFacing || { active: 0, failed: 0, unanswered: 0, rejected: 0 },
        mnoFacing: calls.mnoFacing || { active: 0, failed: 0, unanswered: 0, rejected: 0 },
        gatewayFacing: calls.gatewayFacing || { active: 0, failed: 0, unanswered: 0, rejected: 0 }
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const sides = [
    { key: 'customerFacing', label: 'Customer Facing' },
    { key: 'mnoFacing', label: 'MNO Facing' },
    { key: 'gatewayFacing', label: 'Gateway Facing' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Network Topology</h1>
          <p className="text-slate-500 text-sm">Live reachability, latency, and call metrics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchData}
          className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Trunk Health" icon={Server}>
          <div className="divide-y divide-slate-100 -m-6">
            {trunks.length === 0 && <p className="p-6 text-sm text-slate-500">No trunk data available</p>}
            {trunks.map((trunk) => (
              <div key={trunk.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{trunk.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{trunk.latency ? `${trunk.latency}ms` : 'N/A'}</p>
                </div>
                <StatusBadge status={trunk.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="IP Reachability" icon={Activity}>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(reachability).map(([target, status]) => (
              <div key={target} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">{target}</p>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Link Latency" icon={Zap}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="text-left pb-3 font-semibold">Destination</th>
                <th className="text-right pb-3 font-semibold">RTT</th>
                <th className="text-right pb-3 font-semibold">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(latency).map(([target, val]) => {
                const q = getLatencyQuality(val);
                return (
                  <tr key={target} className="hover:bg-slate-50">
                    <td className="py-3.5 capitalize text-slate-900 font-medium">{target}</td>
                    <td className="py-3.5 text-right font-mono tabular-nums text-slate-600">{val > 0 ? `${val}ms` : 'N/A'}</td>
                    <td className={`py-3.5 text-right text-xs font-bold ${qualityClass(q)}`}>{q}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title="Call Statistics" icon={Phone}>
          <div className="grid grid-cols-1 gap-4">
            {sides.map((side) => {
              const stats = callStats[side.key] || {};
              return (
                <div key={side.key} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">{side.label}</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {['active', 'failed', 'unanswered', 'rejected'].map((k) => (
                      <div key={k} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                        <p className={`text-lg font-bold tabular-nums ${k === 'failed' ? 'text-red-600' : 'text-slate-900'}`}>{stats[k] ?? 0}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{k}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default NetworkMonitoring;
