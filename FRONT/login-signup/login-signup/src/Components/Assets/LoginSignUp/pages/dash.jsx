import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Server
} from 'lucide-react';
import { getTrunks, getNetworkStatus } from '../../../../services/monitoringService';

const Dashboard = () => {
  const [trunks, setTrunks] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    status: 'optimal',
    avgLatency: 0,
    packetLoss: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [trunksData, networkData] = await Promise.all([
        getTrunks(),
        getNetworkStatus()
      ]);
      setTrunks(trunksData);
      setNetworkStatus(networkData);
      setLoading(false);
    };
    
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalTrunks = trunks.length;
  const trunksUp = trunks.filter(t => t.status === 'up').length;
  const trunksDown = trunks.filter(t => t.status === 'down').length;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <SummaryCard label="Total Trunks" value={totalTrunks} icon={<Server />} />
        <SummaryCard label="Trunks UP" value={trunksUp} icon={<CheckCircle2 />} color="text-emerald-500" />
        <SummaryCard label="Trunks DOWN" value={trunksDown} icon={<AlertCircle />} color="text-red-500" />
        <SummaryCard label="Latency" value={`${networkStatus.avgLatency}ms`} icon={<Activity />} sub={networkStatus.status} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-[#0A0A0A] border border-zinc-800 rounded-xl overflow-hidden"
      >
        <table className="w-full text-left">
          <thead className="bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              {['Trunk Name', 'Status', 'Latency', 'Last Changed'].map(h => (
                <th key={h} className="p-4 text-xs uppercase text-zinc-500 tracking-widest font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <AnimatePresence>
              {trunks.map(trunk => (
                <motion.tr 
                  key={trunk.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-zinc-900/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-medium">{trunk.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${trunk.status === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {trunk.status === 'up' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {trunk.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-zinc-400">{trunk.latency || '—'}ms</td>
                  <td className="p-4 text-sm text-zinc-400">{trunk.lastChanged || '—'}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </>
  );
};

const SummaryCard = ({ label, value, icon, color = "text-white", sub }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between"
  >
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">{label}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
    <div className="text-zinc-600">{icon}</div>
  </motion.div>
);

export default Dashboard;
