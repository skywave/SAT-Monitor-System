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
        <SummaryCard label="Total Trunks" value={totalTrunks} icon={<Server className="w-5 h-5 text-blue-600" />} />
        <SummaryCard label="Trunks UP" value={trunksUp} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} color="text-emerald-600" />
        <SummaryCard label="Trunks DOWN" value={trunksDown} icon={<AlertCircle className="w-5 h-5 text-red-600" />} color="text-red-600" />
        <SummaryCard label="Latency" value={`${networkStatus.avgLatency}ms`} icon={<Activity className="w-5 h-5 text-blue-600" />} sub={networkStatus.status} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
      >
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Trunk Name', 'Status', 'Latency', 'Last Changed'].map(h => (
                <th key={h} className="p-4 text-xs uppercase text-slate-500 tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {trunks.map(trunk => (
                <motion.tr 
                  key={trunk.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-medium text-slate-900">{trunk.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${trunk.status === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {trunk.status === 'up' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {trunk.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-600">{trunk.latency || '—'}ms</td>
                  <td className="p-4 text-sm text-slate-600">{trunk.lastChanged || '—'}</td>
                </motion.tr>
              ))}
              {trunks.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No trunk data available</td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </>
  );
};

const SummaryCard = ({ label, value, icon, color = "text-slate-900", sub }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between shadow-sm"
  >
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      {sub && <p className="text-xs text-slate-400 mt-1 capitalize">{sub}</p>}
    </div>
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
  </motion.div>
);

export default Dashboard;
