import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './networkmonitoring.css';

// Initialize Supabase
const supabaseUrl = 'https://mlpfnfbgpraprzuysnge.supabase.co';
const supabaseKey = 'sb_publishable_F6Hzt-MAkdwuxVMYz4DKtA__FSnDOVM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
const getStatus = (statusText, latency) => {
  if (statusText === 'registration_failed' || statusText === 'unreachable' || statusText === 'down') {
    return 'down';
  }
  if (latency && latency > 100) {
    return 'warning';
  }
  return 'up';
};

const getStatusColor = (status) => {
  return status === 'up' || status === 'reachable' ? 'status-up' : 'status-down';
};

const getLatencyQuality = (latency) => {
  if (!latency && latency !== 0) return 'N/A';
  if (latency < 20) return 'Excellent';
  if (latency < 50) return 'Good';
  if (latency < 100) return 'Fair';
  return 'Poor';
};

const NetworkMonitoring = () => {
  const navigate = useNavigate();
  
  const [trunks, setTrunks] = useState([]);
  const [satMonitorReachability, setSatMonitorReachability] = useState({
    gateway: 'reachable',
    nas: 'reachable',
    mno: 'unreachable',
    customer: 'reachable',
    google: 'reachable'
  });
  const [satMonitorLatency, setSatMonitorLatency] = useState({
    gateway: 0,
    nas: 0,
    customer: 0,
    google: 0
  });
  const [satMonitorBandwidth, setSatMonitorBandwidth] = useState({
    gateway: 0,
    nas: 0,
    mno: 0,
    customer: 0,
    google: 0
  });
  const [callStats, setCallStats] = useState({
    trunks: {},
    customerFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 },
    mnoFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 },
    gatewayFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchTrunks = async () => {
    try {
      // REMOVED destination_ip since it's no longer in the table
      const { data, error } = await supabase
        .from('trunk_monitoring')
        .select('trunk_id, trunk_name, status_text, current_latency_ms')
        .order('last_checked', { ascending: false });
      
      if (error) throw error;
      
      const trunkMap = new Map();
      data.forEach(trunk => {
        if (!trunkMap.has(trunk.trunk_id)) {
          trunkMap.set(trunk.trunk_id, {
            id: trunk.trunk_id,
            name: trunk.trunk_name,
            ipAddress: 'N/A', // No longer available
            status: getStatus(trunk.status_text, trunk.current_latency_ms)
          });
        }
      });
      
      setTrunks(Array.from(trunkMap.values()));
    } catch (error) {
      console.error('Error fetching trunks:', error);
    }
  };

  const fetchNetworkData = async () => {
    try {
      const { data, error } = await supabase
        .from('network_monitoring')
        .select('device_name, ip_address, reachable, latency_ms')
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const deviceMap = new Map();
      data.forEach(device => {
        const key = device.device_name.toLowerCase();
        if (!deviceMap.has(key)) {
          deviceMap.set(key, device);
        }
      });
      
      const reachability = {};
      const latency = {};
      
      deviceMap.forEach((device, key) => {
        const status = device.reachable ? 'reachable' : 'unreachable';
        
        if (key.includes('gateway') || key.includes('router')) {
          reachability.gateway = status;
          latency.gateway = device.latency_ms || 0;
        } else if (key.includes('nas')) {
          reachability.nas = status;
          latency.nas = device.latency_ms || 0;
        } else if (key.includes('mno')) {
          reachability.mno = status;
          latency.mno = device.latency_ms || 0;
        } else if (key.includes('customer')) {
          reachability.customer = status;
          latency.customer = device.latency_ms || 0;
        } else if (key.includes('google') || key.includes('dns')) {
          reachability.google = status;
          latency.google = device.latency_ms || 0;
        }
      });
      
      setSatMonitorReachability(prev => ({ ...prev, ...reachability }));
      setSatMonitorLatency(prev => ({ ...prev, ...latency }));
    } catch (error) {
      console.error('Error fetching network data:', error);
    }
  };

  const fetchBandwidth = async () => {
    try {
      const { data, error } = await supabase
        .from('bandwidth_monitoring')
        .select('device_name, bandwidth_out_mbps')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const bandwidth = {};
      data.forEach(device => {
        const key = device.device_name.toLowerCase();
        const kbps = Math.round((device.bandwidth_out_mbps || 0) * 1000);
        
        if (key.includes('gateway')) bandwidth.gateway = kbps;
        else if (key.includes('nas')) bandwidth.nas = kbps;
        else if (key.includes('mno')) bandwidth.mno = kbps;
        else if (key.includes('customer')) bandwidth.customer = kbps;
        else if (key.includes('google')) bandwidth.google = kbps;
      });
      
      setSatMonitorBandwidth(prev => ({ ...prev, ...bandwidth }));
    } catch (error) {
      console.error('Error fetching bandwidth:', error);
    }
  };

  const fetchCallStats = async () => {
    try {
      const { data, error } = await supabase
        .from('call_monitoring')
        .select('trunk_id, active_calls, total_calls, failed_calls, no_answer_calls, rejected_calls')
        .eq('period_type', 'minute')
        .order('period_start', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const aggregated = data.reduce((acc, row) => {
          acc.active += row.active_calls || 0;
          acc.failed += row.failed_calls || 0;
          acc.unanswered += row.no_answer_calls || 0;
          acc.rejected += row.rejected_calls || 0;
          return acc;
        }, { active: 0, failed: 0, unanswered: 0, rejected: 0 });
        
        const perTrunk = {};
        data.forEach(row => {
          if (row.trunk_id && !perTrunk[row.trunk_id]) {
            perTrunk[row.trunk_id] = {
              active: row.active_calls || 0,
              failed: row.failed_calls || 0,
              unanswered: row.no_answer_calls || 0,
              rejected: row.rejected_calls || 0
            };
          }
        });
        
        setCallStats({
          trunks: perTrunk,
          customerFacing: aggregated,
          mnoFacing: aggregated,
          gatewayFacing: { active: aggregated.active, failed: 0, unanswered: 0, rejected: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching call stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTrunks(),
        fetchNetworkData(),
        fetchBandwidth(),
        fetchCallStats()
      ]);
      setLoading(false);
    };
    
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading && trunks.length === 0) {
    return (
      <div className="network-monitoring">
        <div style={{textAlign: 'center', padding: '4rem'}}>
          <h2>Loading monitoring data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="network-monitoring">
      <div className="network-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBackToDashboard}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Network Monitoring</h1>
            <span className="subtitle">Real-time Network Topology & Metrics</span>
          </div>
          <div className="live-badge">
            <span className="pulse-dot"></span>
            LIVE MONITORING
          </div>
        </div>
      </div>

      <div className="network-content">
        {/* Trunk Status Section */}
        <div className="section-title">
          <h2>Trunk Status</h2>
          <span className="section-subtitle">Monitored Trunks</span>
        </div>

        <div className="trunk-status-grid">
          {trunks.length > 0 ? trunks.map(trunk => (
            <div key={trunk.id} className={`trunk-card ${getStatusColor(trunk.status)}`}>
              <div className="trunk-name">{trunk.name}</div>
              <div className="trunk-ip">{trunk.ipAddress || 'N/A'}</div>
              <div className={`trunk-status-badge ${getStatusColor(trunk.status)}`}>
                <span className="status-dot">●</span>
                {trunk.status === 'up' ? 'UP' : trunk.status === 'warning' ? 'WARNING' : 'DOWN'}
              </div>
            </div>
          )) : (
            <div style={{padding: '2rem', textAlign: 'center', gridColumn: '1 / -1'}}>
              No trunk data available
            </div>
          )}
        </div>

        {/* IP Reachability Section */}
        <div className="section-title">
          <h2>IP Reachability</h2>
          <span className="section-subtitle">ICMP Echo Test Results</span>
        </div>

        <div className="reachability-container">
          <div className="reachability-section">
            <h3 className="subsection-title">From SAT Monitor</h3>
            <div className="reachability-grid">
              {Object.entries(satMonitorReachability).map(([target, status]) => (
                <div key={`sat-${target}`} className={`reach-card ${getStatusColor(status)}`}>
                  <div className="reach-target">{target.toUpperCase()}</div>
                  <div className={`reach-status ${getStatusColor(status)}`}>
                    <span className="status-icon">●</span>
                    {status === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Link Latency Section */}
        <div className="section-title">
          <h2>Link Latency</h2>
          <span className="section-subtitle">Round-Trip Time (RTT) in milliseconds</span>
        </div>

        <div className="latency-container">
          <table className="latency-table">
            <thead>
              <tr><th>Source</th><th>Destination</th><th>Latency</th><th>Quality</th></tr>
            </thead>
            <tbody>
              <tr><td className="source-cell">SAT Monitor</td><td>Gateway</td><td className="latency-value">{satMonitorLatency.gateway || 0}ms</td><td><span className={`quality-badge ${getLatencyQuality(satMonitorLatency.gateway).toLowerCase()}`}>{getLatencyQuality(satMonitorLatency.gateway)}</span></td></tr>
              <tr><td className="source-cell">SAT Monitor</td><td>NAS</td><td className="latency-value">{satMonitorLatency.nas || 0}ms</td><td><span className={`quality-badge ${getLatencyQuality(satMonitorLatency.nas).toLowerCase()}`}>{getLatencyQuality(satMonitorLatency.nas)}</span></td></tr>
              <tr><td className="source-cell">SAT Monitor</td><td>Customer Server</td><td className="latency-value">{satMonitorLatency.customer || 0}ms</td><td><span className={`quality-badge ${getLatencyQuality(satMonitorLatency.customer).toLowerCase()}`}>{getLatencyQuality(satMonitorLatency.customer)}</span></td></tr>
              <tr><td className="source-cell">SAT Monitor</td><td>Google</td><td className="latency-value">{satMonitorLatency.google || 0}ms</td><td><span className={`quality-badge ${getLatencyQuality(satMonitorLatency.google).toLowerCase()}`}>{getLatencyQuality(satMonitorLatency.google)}</span></td></tr>
            </tbody>
          </table>
        </div>

        {/* Link Bandwidth Section - Shows N/A for Phase 1 */}
        <div className="section-title">
          <h2>Link Bandwidth</h2>
          <span className="section-subtitle">Available bandwidth in Kbps</span>
        </div>

        <div className="bandwidth-container">
          <div className="bandwidth-section">
            <h3 className="subsection-title">From SAT Monitor</h3>
            <div className="bandwidth-grid">
              {Object.entries(satMonitorBandwidth).map(([key, value]) => (
                <div key={key} className="bandwidth-card">
                  <div className="bandwidth-target">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <div className="bandwidth-value">{value > 0 ? `${value} Kbps` : 'N/A'}</div>
                  <div className="bandwidth-bar"><div className="bandwidth-fill" style={{width: value > 0 ? `${Math.min((value / 1024) * 100, 100)}%` : '0%'}}></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call Statistics Section */}
        <div className="section-title">
          <h2>Call Statistics</h2>
          <span className="section-subtitle">Since 00:00 Today</span>
        </div>

        <div className="call-aggregate-grid">
          <div className="aggregate-card customer"><h4>Customer Facing Side</h4><div className="aggregate-stats">
            <div className="agg-stat"><span className="agg-label">Active</span><span className="agg-value">{callStats.customerFacing.active}</span></div>
            <div className="agg-stat"><span className="agg-label">Failed</span><span className="agg-value failed">{callStats.customerFacing.failed}</span></div>
            <div className="agg-stat"><span className="agg-label">Unanswered</span><span className="agg-value">{callStats.customerFacing.unanswered}</span></div>
            <div className="agg-stat"><span className="agg-label">Rejected</span><span className="agg-value">{callStats.customerFacing.rejected}</span></div>
          </div></div>
          <div className="aggregate-card mno"><h4>MNO Facing Side</h4><div className="aggregate-stats">
            <div className="agg-stat"><span className="agg-label">Active</span><span className="agg-value">{callStats.mnoFacing.active}</span></div>
            <div className="agg-stat"><span className="agg-label">Failed</span><span className="agg-value failed">{callStats.mnoFacing.failed}</span></div>
            <div className="agg-stat"><span className="agg-label">Unanswered</span><span className="agg-value">{callStats.mnoFacing.unanswered}</span></div>
            <div className="agg-stat"><span className="agg-label">Rejected</span><span className="agg-value">{callStats.mnoFacing.rejected}</span></div>
          </div></div>
          <div className="aggregate-card gateway"><h4>Gateway Facing Side</h4><div className="aggregate-stats">
            <div className="agg-stat"><span className="agg-label">Active</span><span className="agg-value">{callStats.gatewayFacing.active}</span></div>
            <div className="agg-stat"><span className="agg-label">Failed</span><span className="agg-value failed">{callStats.gatewayFacing.failed}</span></div>
            <div className="agg-stat"><span className="agg-label">Unanswered</span><span className="agg-value">{callStats.gatewayFacing.unanswered}</span></div>
            <div className="agg-stat"><span className="agg-label">Rejected</span><span className="agg-value">{callStats.gatewayFacing.rejected}</span></div>
          </div></div>
        </div>

        {/* Per-Trunk Stats */}
        <div className="per-trunk-container">
          <h3 className="subsection-title">Per-Trunk Statistics</h3>
          <table className="trunk-stats-table">
            <thead><tr><th>Trunk Name</th><th>Active Calls</th><th>Failed Calls</th><th>Unanswered Calls</th><th>Rejected Calls</th></tr></thead>
            <tbody>
              {Object.keys(callStats.trunks).length > 0 ? Object.entries(callStats.trunks).map(([trunkName, stats]) => (
                <tr key={trunkName}><td className="trunk-name-cell">{trunkName}</td><td className="stat-cell active">{stats.active}</td><td className="stat-cell failed">{stats.failed}</td><td className="stat-cell unanswered">{stats.unanswered}</td><td className="stat-cell rejected">{stats.rejected}</td></tr>
              )) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>No per-trunk data available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NetworkMonitoring;