import React, { useState, useEffect } from 'react';
// 1. Updated import: useHistory is replaced by useNavigate
import { useNavigate } from 'react-router-dom';
import './networkmonitoring.css';

const NetworkMonitoring = () => {
  // 2. Initialize useNavigate
  const navigate = useNavigate();
  
  // Trunk status between components
  const [trunkStatus, setTrunkStatus] = useState({
    sbcToGateway: 'up',
    sbcToNAS: 'up',
    sbcToMNO: 'down',
    sbcToCustomer: 'up'
  });

  // IP Reachability from SAT Monitor
  const [satMonitorReachability, setSatMonitorReachability] = useState({
    gateway: 'reachable',
    nas: 'reachable',
    mno: 'unreachable',
    customer: 'reachable',
    google: 'reachable'
  });

  // IP Reachability from SBC
  const [sbcReachability, setSbcReachability] = useState({
    gateway: 'reachable',
    nas: 'reachable',
    mno: 'unreachable',
    customer: 'reachable',
    google: 'reachable'
  });

  // Latency from SAT Monitor
  const [satMonitorLatency, setSatMonitorLatency] = useState({
    gateway: 12,
    nas: 15,
    customer: 18,
    google: 8
  });

  // Latency from SBC
  const [sbcLatency, setSbcLatency] = useState({
    gateway: 5,
    nas: 7,
    mno: null,
    customer: 10,
    google: 6
  });

  // Bandwidth from SAT Monitor
  const [satMonitorBandwidth, setSatMonitorBandwidth] = useState({
    gateway: 256,
    nas: 256,
    mno: 128,
    customer: 512,
    google: 1024
  });

  // Bandwidth from SBC
  const [sbcBandwidth, setSbcBandwidth] = useState({
    gateway: 512,
    nas: 256,
    mno: 128,
    customer: 512,
    google: 1024
  });

  // Call statistics
  const [callStats, setCallStats] = useState({
    trunks: {
      'MTN SIP': { active: 12, failed: 3, unanswered: 7, rejected: 2 },
      'Airtel': { active: 0, failed: 15, unanswered: 8, rejected: 5 },
      'Zamtel Primary': { active: 8, failed: 1, unanswered: 3, rejected: 0 },
      'Orange SIP': { active: 5, failed: 2, unanswered: 4, rejected: 1 }
    },
    customerFacing: { active: 25, failed: 6, unanswered: 14, rejected: 3 },
    mnoFacing: { active: 25, failed: 21, unanswered: 22, rejected: 8 },
    gatewayFacing: { active: 25, failed: 0, unanswered: 0, rejected: 0 }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSatMonitorLatency(prev => ({
        gateway: Math.floor(Math.random() * 10) + 8,
        nas: Math.floor(Math.random() * 10) + 10,
        customer: Math.floor(Math.random() * 10) + 13,
        google: Math.floor(Math.random() * 5) + 5
      }));

      setSbcLatency(prev => ({
        gateway: Math.floor(Math.random() * 5) + 3,
        nas: Math.floor(Math.random() * 5) + 5,
        mno: prev.mno,
        customer: Math.floor(Math.random() * 8) + 7,
        google: Math.floor(Math.random() * 5) + 4
      }));

      setCallStats(prev => ({
        ...prev,
        customerFacing: {
          ...prev.customerFacing,
          active: Math.floor(Math.random() * 30) + 15
        },
        mnoFacing: {
          ...prev.mnoFacing,
          active: Math.floor(Math.random() * 30) + 15
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 3. Updated navigation logic: history.push becomes navigate()
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
          <span className="section-subtitle">SBC Connection Status</span>
        </div>

        <div className="trunk-status-grid">
          <div className={`trunk-link-card ${getStatusColor(trunkStatus.sbcToGateway)}`}>
            <div className="link-endpoints">
              <span className="endpoint">SBC</span>
              <span className="link-arrow">→</span>
              <span className="endpoint">Gateway</span>
            </div>
            <div className={`link-status ${getStatusColor(trunkStatus.sbcToGateway)}`}>
              <span className="status-dot">●</span>
              {trunkStatus.sbcToGateway === 'up' ? 'UP' : 'DOWN'}
            </div>
          </div>

          <div className={`trunk-link-card ${getStatusColor(trunkStatus.sbcToNAS)}`}>
            <div className="link-endpoints">
              <span className="endpoint">SBC</span>
              <span className="link-arrow">→</span>
              <span className="endpoint">NAS</span>
            </div>
            <div className={`link-status ${getStatusColor(trunkStatus.sbcToNAS)}`}>
              <span className="status-dot">●</span>
              {trunkStatus.sbcToNAS === 'up' ? 'UP' : 'DOWN'}
            </div>
          </div>

          <div className={`trunk-link-card ${getStatusColor(trunkStatus.sbcToMNO)}`}>
            <div className="link-endpoints">
              <span className="endpoint">SBC</span>
              <span className="link-arrow">→</span>
              <span className="endpoint">MNO</span>
            </div>
            <div className={`link-status ${getStatusColor(trunkStatus.sbcToMNO)}`}>
              <span className="status-dot">●</span>
              {trunkStatus.sbcToMNO === 'up' ? 'UP' : 'DOWN'}
            </div>
          </div>

          <div className={`trunk-link-card ${getStatusColor(trunkStatus.sbcToCustomer)}`}>
            <div className="link-endpoints">
              <span className="endpoint">SBC</span>
              <span className="link-arrow">→</span>
              <span className="endpoint">Customer</span>
            </div>
            <div className={`link-status ${getStatusColor(trunkStatus.sbcToCustomer)}`}>
              <span className="status-dot">●</span>
              {trunkStatus.sbcToCustomer === 'up' ? 'UP' : 'DOWN'}
            </div>
          </div>
        </div>

        {/* Section 2: IP Reachability */}
        <div className="section-title">
          <h2>IP Reachability</h2>
          <span className="section-subtitle">ICMP Echo Test Results</span>
        </div>

        <div className="reachability-container">
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

        {/* Call Statistics */}
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
              {Object.entries(callStats.trunks).map(([trunkName, stats]) => (
                <tr key={trunkName}>
                  <td className="trunk-name-cell">{trunkName}</td>
                  <td className="stat-cell active">{stats.active}</td>
                  <td className="stat-cell failed">{stats.failed}</td>
                  <td className="stat-cell unanswered">{stats.unanswered}</td>
                  <td className="stat-cell rejected">{stats.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default NetworkMonitoring;