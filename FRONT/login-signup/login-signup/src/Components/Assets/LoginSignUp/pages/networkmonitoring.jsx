import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './networkmonitoring.css';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://mlpfnfbgpraprzuysnge.supabase.co';
const supabaseKey = 'sb_publishable_F6Hzt-MAkdwuxVMYz4DKtA__FSnDOVM';
const supabase = createClient(supabaseUrl, supabaseKey);

const NetworkMonitoring = () => {
  const navigate = useNavigate();
  
  // Individual trunk status
  const [trunks, setTrunks] = useState([]);

  // IP Reachability from SAT Monitor
  const [satMonitorReachability, setSatMonitorReachability] = useState({
    gateway: 'reachable',
    nas: 'reachable',
    mno: 'unreachable',
    customer: 'reachable',
    google: 'reachable'
  });

  // IP Reachability from SBC (mock - no SBC data yet)
  const [sbcReachability, setSbcReachability] = useState({
    gateway: 'reachable',
    nas: 'reachable',
    mno: 'unreachable',
    customer: 'reachable',
    google: 'reachable'
  });

  // Latency from SAT Monitor
  const [satMonitorLatency, setSatMonitorLatency] = useState({
    gateway: 0,
    nas: 0,
    customer: 0,
    google: 0
  });

  // Latency from SBC (mock)
  const [sbcLatency, setSbcLatency] = useState({
    gateway: 5,
    nas: 7,
    mno: null,
    customer: 10,
    google: 6
  });

  // Bandwidth from SAT Monitor
  const [satMonitorBandwidth, setSatMonitorBandwidth] = useState({
    gateway: 0,
    nas: 0,
    mno: 0,
    customer: 0,
    google: 0
  });

  // Bandwidth from SBC (mock)
  const [sbcBandwidth, setSbcBandwidth] = useState({
    gateway: 512,
    nas: 256,
    mno: 128,
    customer: 512,
    google: 1024
  });

  // Call statistics
  const [callStats, setCallStats] = useState({
    trunks: {},
    customerFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 },
    mnoFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 },
    gatewayFacing: { active: 0, failed: 0, unanswered: 0, rejected: 0 }
  });

  // Fetch trunk status
  const fetchTrunks = async () => {
    try {
      const { data, error } = await supabase
        .from('trunk_monitoring')
        .select('trunk_id, trunk_name, destination_ip, status_text')
        .order('last_checked', { ascending: false });
      
      if (error) throw error;
      
      // Get unique trunks (latest entry for each)
      const trunkMap = new Map();
      data.forEach(trunk => {
        if (!trunkMap.has(trunk.trunk_id)) {
          trunkMap.set(trunk.trunk_id, {
            id: trunk.trunk_id,
            name: trunk.trunk_name,
            ipAddress: trunk.destination_ip,
            status: trunk.status_text === 'idle' ? 'up' : 'down'
          });
        }
      });
      
      setTrunks(Array.from(trunkMap.values()));
    } catch (error) {
      console.error('Error fetching trunks:', error);
    }
  };

  // Fetch network reachability and latency
  const fetchNetworkData = async () => {
    try {
      const { data, error } = await supabase
        .from('network_monitoring')
        .select('device_name, ip_address, reachable, latency_ms')
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Get latest for each device
      const deviceMap = new Map();
      data.forEach(device => {
        const key = device.device_name.toLowerCase();
        if (!deviceMap.has(key)) {
          deviceMap.set(key, device);
        }
      });
      
      // Map to state
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

  // Fetch bandwidth data
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
      });
      
      setSatMonitorBandwidth(prev => ({ ...prev, ...bandwidth }));
    } catch (error) {
      console.error('Error fetching bandwidth:', error);
    }
  };

  // Fetch call statistics
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
        // Aggregate stats
        const aggregated = data.reduce((acc, row) => {
          acc.active += row.active_calls || 0;
          acc.failed += row.failed_calls || 0;
          acc.unanswered += row.no_answer_calls || 0;
          acc.rejected += row.rejected_calls || 0;
          return acc;
        }, { active: 0, failed: 0, unanswered: 0, rejected: 0 });
        
        setCallStats({
          trunks: {},
          customerFacing: aggregated,
          mnoFacing: aggregated,
          gatewayFacing: { active: aggregated.active, failed: 0, unanswered: 0, rejected: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching call stats:', error);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTrunks(),
        fetchNetworkData(),
        fetchBandwidth(),
        fetchCallStats()
      ]);
    };
    
    loadData();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const getStatusColor = (status) => {
    return status === 'up' || status === 'reachable' ? 'status-up' : 'status-down';
  };

  const getLatencyQuality = (latency) => {
    if (!latency) return 'N/A';
    if (latency < 20) return 'Excellent';
    if (latency < 50) return 'Good';
    if (latency < 100) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="network-monitoring">
      {/* Header */}
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

      {/* Main Content */}
      <div className="network-content">
        
        {/* Section 1: Trunk Status */}
        <div className="section-title">
          <h2>Trunk Status</h2>
          <span className="section-subtitle">Monitored Trunks</span>
        </div>

        <div className="trunk-status-grid">
          {trunks.length > 0 ? trunks.map(trunk => (
            <div key={trunk.id} className={`trunk-card ${getStatusColor(trunk.status)}`}>
              <div className="trunk-name">{trunk.name}</div>
              <div className="trunk-ip">{trunk.ipAddress}</div>
              <div className={`trunk-status-badge ${getStatusColor(trunk.status)}`}>
                <span className="status-dot">●</span>
                {trunk.status === 'up' ? 'UP' : 'DOWN'}
              </div>
            </div>
          )) : (
            <div style={{padding: '2rem', textAlign: 'center', gridColumn: '1 / -1'}}>
              Loading trunks...
            </div>
          )}
        </div>

        {/* Section 2: IP Reachability */}
        <div className="section-title">
          <h2>IP Reachability</h2>
          <span className="section-subtitle">ICMP Echo Test Results</span>
        </div>

        <div className="reachability-container">
          {/* From SAT Monitor */}
          <div className="reachability-section">
            <h3 className="subsection-title">From SAT Monitor</h3>
            <div className="reachability-grid">
              <div className={`reach-card ${getStatusColor(satMonitorReachability.gateway)}`}>
                <div className="reach-target">Gateway</div>
                <div className={`reach-status ${getStatusColor(satMonitorReachability.gateway)}`}>
                  <span className="status-icon">●</span>
                  {satMonitorReachability.gateway === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(satMonitorReachability.nas)}`}>
                <div className="reach-target">NAS</div>
                <div className={`reach-status ${getStatusColor(satMonitorReachability.nas)}`}>
                  <span className="status-icon">●</span>
                  {satMonitorReachability.nas === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(satMonitorReachability.mno)}`}>
                <div className="reach-target">MNO</div>
                <div className={`reach-status ${getStatusColor(satMonitorReachability.mno)}`}>
                  <span className="status-icon">●</span>
                  {satMonitorReachability.mno === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(satMonitorReachability.customer)}`}>
                <div className="reach-target">Customer Server</div>
                <div className={`reach-status ${getStatusColor(satMonitorReachability.customer)}`}>
                  <span className="status-icon">●</span>
                  {satMonitorReachability.customer === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(satMonitorReachability.google)}`}>
                <div className="reach-target">Google</div>
                <div className={`reach-status ${getStatusColor(satMonitorReachability.google)}`}>
                  <span className="status-icon">●</span>
                  {satMonitorReachability.google === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>
            </div>
          </div>

          {/* From SBC */}
          <div className="reachability-section">
            <h3 className="subsection-title">From SBC</h3>
            <div className="reachability-grid">
              <div className={`reach-card ${getStatusColor(sbcReachability.gateway)}`}>
                <div className="reach-target">Gateway</div>
                <div className={`reach-status ${getStatusColor(sbcReachability.gateway)}`}>
                  <span className="status-icon">●</span>
                  {sbcReachability.gateway === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(sbcReachability.nas)}`}>
                <div className="reach-target">NAS</div>
                <div className={`reach-status ${getStatusColor(sbcReachability.nas)}`}>
                  <span className="status-icon">●</span>
                  {sbcReachability.nas === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(sbcReachability.mno)}`}>
                <div className="reach-target">MNO</div>
                <div className={`reach-status ${getStatusColor(sbcReachability.mno)}`}>
                  <span className="status-icon">●</span>
                  {sbcReachability.mno === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(sbcReachability.customer)}`}>
                <div className="reach-target">Customer Server</div>
                <div className={`reach-status ${getStatusColor(sbcReachability.customer)}`}>
                  <span className="status-icon">●</span>
                  {sbcReachability.customer === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>

              <div className={`reach-card ${getStatusColor(sbcReachability.google)}`}>
                <div className="reach-target">Google</div>
                <div className={`reach-status ${getStatusColor(sbcReachability.google)}`}>
                  <span className="status-icon">●</span>
                  {sbcReachability.google === 'reachable' ? 'REACHABLE' : 'UNREACHABLE'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Link Latency */}
        <div className="section-title">
          <h2>Link Latency</h2>
          <span className="section-subtitle">Round-Trip Time (RTT) in milliseconds</span>
        </div>

        <div className="latency-container">
          <table className="latency-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Destination</th>
                <th>Latency</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="source-cell">SAT Monitor</td>
                <td>Gateway</td>
                <td className="latency-value">{satMonitorLatency.gateway}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(satMonitorLatency.gateway)}</span></td>
              </tr>
              <tr>
                <td className="source-cell">SAT Monitor</td>
                <td>NAS</td>
                <td className="latency-value">{satMonitorLatency.nas}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(satMonitorLatency.nas)}</span></td>
              </tr>
              <tr>
                <td className="source-cell">SAT Monitor</td>
                <td>Customer Server</td>
                <td className="latency-value">{satMonitorLatency.customer}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(satMonitorLatency.customer)}</span></td>
              </tr>
              <tr>
                <td className="source-cell">SAT Monitor</td>
                <td>Google</td>
                <td className="latency-value">{satMonitorLatency.google}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(satMonitorLatency.google)}</span></td>
              </tr>
              
              <tr className="separator-row">
                <td className="source-cell">SBC</td>
                <td>Gateway</td>
                <td className="latency-value">{sbcLatency.gateway}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(sbcLatency.gateway)}</span></td>
              </tr>
              <tr>
                <td className="source-cell">SBC</td>
                <td>NAS</td>
                <td className="latency-value">{sbcLatency.nas}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(sbcLatency.nas)}</span></td>
              </tr>
              <tr>
                <td className="source-cell">SBC</td>
                <td>MNO</td>
                <td className="latency-value">{sbcLatency.mno ? `${sbcLatency.mno}ms` : '—'}</td>
                <td><span className="quality-badge unavailable">N/A</span></td>
              </tr>
              <tr>
                <td className="source-cell">SBC</td>
                <td>Customer Server</td>
                <td className="latency-value">{sbcLatency.customer}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(sbcLatency.customer)}</span></td>
              </tr>
              <tr>
                <td className="source-cell">SBC</td>
                <td>Google</td>
                <td className="latency-value">{sbcLatency.google}ms</td>
                <td><span className="quality-badge excellent">{getLatencyQuality(sbcLatency.google)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Link Bandwidth */}
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
                  <div className="bandwidth-value">{value} Kbps</div>
                  <div className="bandwidth-bar">
                    <div className="bandwidth-fill" style={{width: `${Math.min((value / 1024) * 100, 100)}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bandwidth-section">
            <h3 className="subsection-title">From SBC</h3>
            <div className="bandwidth-grid">
              {Object.entries(sbcBandwidth).map(([key, value]) => (
                <div key={key} className="bandwidth-card">
                  <div className="bandwidth-target">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <div className="bandwidth-value">{value} Kbps</div>
                  <div className="bandwidth-bar">
                    <div className="bandwidth-fill" style={{width: `${Math.min((value / 1024) * 100, 100)}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5-8: Call Statistics */}
        <div className="section-title">
          <h2>Call Statistics</h2>
          <span className="section-subtitle">Since 00:00 Today</span>
        </div>

        <div className="call-aggregate-grid">
          <div className="aggregate-card customer">
            <h4>Customer Facing Side</h4>
            <div className="aggregate-stats">
              <div className="agg-stat">
                <span className="agg-label">Active</span>
                <span className="agg-value">{callStats.customerFacing.active}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Failed</span>
                <span className="agg-value failed">{callStats.customerFacing.failed}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Unanswered</span>
                <span className="agg-value">{callStats.customerFacing.unanswered}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Rejected</span>
                <span className="agg-value">{callStats.customerFacing.rejected}</span>
              </div>
            </div>
          </div>

          <div className="aggregate-card mno">
            <h4>MNO Facing Side</h4>
            <div className="aggregate-stats">
              <div className="agg-stat">
                <span className="agg-label">Active</span>
                <span className="agg-value">{callStats.mnoFacing.active}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Failed</span>
                <span className="agg-value failed">{callStats.mnoFacing.failed}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Unanswered</span>
                <span className="agg-value">{callStats.mnoFacing.unanswered}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Rejected</span>
                <span className="agg-value">{callStats.mnoFacing.rejected}</span>
              </div>
            </div>
          </div>

          <div className="aggregate-card gateway">
            <h4>Gateway Facing Side</h4>
            <div className="aggregate-stats">
              <div className="agg-stat">
                <span className="agg-label">Active</span>
                <span className="agg-value">{callStats.gatewayFacing.active}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Failed</span>
                <span className="agg-value failed">{callStats.gatewayFacing.failed}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Unanswered</span>
                <span className="agg-value">{callStats.gatewayFacing.unanswered}</span>
              </div>
              <div className="agg-stat">
                <span className="agg-label">Rejected</span>
                <span className="agg-value">{callStats.gatewayFacing.rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Trunk Stats */}
        <div className="per-trunk-container">
          <h3 className="subsection-title">Per-Trunk Statistics</h3>
          <table className="trunk-stats-table">
            <thead>
              <tr>
                <th>Trunk Name</th>
                <th>Active Calls</th>
                <th>Failed Calls</th>
                <th>Unanswered Calls</th>
                <th>Rejected Calls</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(callStats.trunks).length > 0 ? (
                Object.entries(callStats.trunks).map(([trunkName, stats]) => (
                  <tr key={trunkName}>
                    <td className="trunk-name-cell">{trunkName}</td>
                    <td className="stat-cell active">{stats.active}</td>
                    <td className="stat-cell failed">{stats.failed}</td>
                    <td className="stat-cell unanswered">{stats.unanswered}</td>
                    <td className="stat-cell rejected">{stats.rejected}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>No per-trunk data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default NetworkMonitoring;