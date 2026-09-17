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
  if (q === 'Excellent') return 'text-emerald-400';
  if (q === 'Good') return 'text-sky-400';
  if (q === 'Fair') return 'text-amber-400';
  if (q === 'Poor') return 'text-red-400';
  return 'text-zinc-500';
};

const StatusBadge = ({ status }) => {
  const map = {
    up: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    reachable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    down: 'bg-red-500/10 text-red-400 border-red-500/20',
    unreachable: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${map[status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {status === 'up' || status === 'reachable' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {status}
    </span>
  );
};

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl overflow-hidden">
    <h3 className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800">
      <Icon className="w-4 h-4 text-purple-400" /> {title}
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
          <h1 className="text-2xl font-bold text-white">Network Topology</h1>
          <p className="text-zinc-500 text-sm">Live reachability, latency, and call metrics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchData}
          className="p-2 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Trunk Health" icon={Server}>
          <div className="divide-y divide-zinc-800 -m-6">
            {trunks.length === 0 && <p className="p-6 text-sm text-zinc-500">No trunk data available</p>}
            {trunks.map((trunk) => (
              <div key={trunk.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{trunk.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{trunk.latency ? `${trunk.latency}ms` : 'N/A'}</p>
                </div>
                <StatusBadge status={trunk.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="IP Reachability" icon={Activity}>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(reachability).map(([target, status]) => (
              <div key={target} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{target}</p>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Link Latency" icon={Zap}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="text-left pb-3">Destination</th>
                <th className="text-right pb-3">RTT</th>
                <th className="text-right pb-3">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {Object.entries(latency).map(([target, val]) => {
                const q = getLatencyQuality(val);
                return (
                  <tr key={target}>
                    <td className="py-3 capitalize text-zinc-300">{target}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{val > 0 ? `${val}ms` : 'N/A'}</td>
                    <td className={`py-3 text-right text-xs font-bold ${qualityClass(q)}`}>{q}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title="Call Statistics" icon={Phone}>
          <div className="grid grid-cols-1 gap-3">
            {sides.map((side) => {
              const stats = callStats[side.key] || {};
              return (
                <div key={side.key} className="p-3 rounded-lg border border-zinc-800">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{side.label}</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {['active', 'failed', 'unanswered', 'rejected'].map((k) => (
                      <div key={k}>
                        <p className={`text-lg font-bold tabular-nums ${k === 'failed' ? 'text-red-400' : 'text-white'}`}>{stats[k] ?? 0}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{k}</p>
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
