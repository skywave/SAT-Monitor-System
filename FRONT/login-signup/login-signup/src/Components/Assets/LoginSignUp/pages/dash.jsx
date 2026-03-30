import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< Updated upstream
import './dash.css';
import { getTrunks, getNetworkStatus } from '../../../../services/monitoringService';
=======
import './Dashboard.css';
>>>>>>> Stashed changes

const Dashboard = () => {
  const navigate = useNavigate();
  
<<<<<<< Updated upstream
  // Real data from Supabase
  const [trunks, setTrunks] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    status: 'optimal',
    avgLatency: 0,
    packetLoss: 0
  });
  const [loading, setLoading] = useState(true);

  // Load data on mount and refresh every 5 seconds
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
    
    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);
=======
  const [trunks, setTrunks] = useState([
    { 
      id: 1, 
      name: 'MTN SIP', 
      pbx: 'PBX-01', 
      status: 'up', 
      latency: 23, 
      bandwidth: 512,
      lastUpdate: Date.now() 
    },
    { 
      id: 2, 
      name: 'Airtel', 
      pbx: 'PBX-01', 
      status: 'down', 
      latency: null, 
      bandwidth: 0,
      lastUpdate: Date.now() 
    },
    { 
      id: 3, 
      name: 'Zamtel Primary', 
      pbx: 'PBX-02', 
      status: 'up', 
      latency: 18, 
      bandwidth: 1024,
      lastUpdate: Date.now() 
    },
    { 
      id: 4, 
      name: 'Zamtel Backup', 
      pbx: 'PBX-02', 
      status: 'warning', 
      latency: 156, 
      bandwidth: 128,
      lastUpdate: Date.now() 
    },
    { 
      id: 5, 
      name: 'Orange SIP', 
      pbx: 'PBX-03', 
      status: 'up', 
      latency: 31, 
      bandwidth: 256,
      lastUpdate: Date.now() 
    },
    { 
      id: 6, 
      name: 'MTN Backup', 
      pbx: 'PBX-01', 
      status: 'up', 
      latency: 27, 
      bandwidth: 512,
      lastUpdate: Date.now() 
    },
    { 
      id: 7, 
      name: 'Liquid SIP', 
      pbx: 'PBX-04', 
      status: 'up', 
      latency: 42, 
      bandwidth: 768,
      lastUpdate: Date.now() 
    },
    { 
      id: 8, 
      name: 'TopStar', 
      pbx: 'PBX-03', 
      status: 'up', 
      latency: 35, 
      bandwidth: 256,
      lastUpdate: Date.now() 
    },
    { 
      id: 9, 
      name: 'Coppernet', 
      pbx: 'PBX-04', 
      status: 'warning', 
      latency: 4, 
      bandwidth: 64,
      lastUpdate: Date.now() 
    }
  ]);

  const [unreadNotifications, setUnreadNotifications] = useState(3);
>>>>>>> Stashed changes

  // Calculate summary stats
  const totalTrunks = trunks.length;
  const trunksUp = trunks.filter(t => t.status === 'up').length;
  const trunksDown = trunks.filter(t => t.status === 'down').length;
  const avgLatency = Math.round(
    trunks.filter(t => t.latency).reduce((sum, t) => sum + t.latency, 0) / 
    trunks.filter(t => t.latency).length
  );

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrunks(prevTrunks => {
        const updatedTrunks = [...prevTrunks];
        const randomIndex = Math.floor(Math.random() * updatedTrunks.length);
        const trunk = updatedTrunks[randomIndex];
        
        if (trunk.status !== 'down') {
          const newLatency = Math.floor(Math.random() * 150) + 5;
          const newBandwidth = [64, 128, 256, 512, 768, 1024][Math.floor(Math.random() * 6)];
          
          updatedTrunks[randomIndex] = {
            ...trunk,
            latency: newLatency,
            bandwidth: newBandwidth,
            status: getStatusFromMetrics(newLatency, newBandwidth),
            lastUpdate: Date.now()
          };
        }
        
        return updatedTrunks;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusFromMetrics = (latency, bandwidth) => {
    // Orange/Warning if latency is too high (>100ms) or too low (<5ms)
    // Or if bandwidth is too low (<128 Kbps) or too high (>900 Kbps)
    if (latency > 100 || latency < 5 || bandwidth < 128 || bandwidth > 900) {
      return 'warning';
    }
    return 'up';
  };

  const getStatusColor = (status) => {
    if (status === 'up') return 'status-up';
    if (status === 'warning') return 'status-warning';
    return 'status-down';
  };

  const getStatusText = (trunk) => {
    if (trunk.status === 'down') return 'DOWN';
    if (trunk.status === 'warning') {
      // Check what's causing the warning
      if (trunk.latency > 100) return 'HIGH LATENCY';
      if (trunk.latency < 5) return 'LOW LATENCY';
      if (trunk.bandwidth < 128) return 'LOW BANDWIDTH';
      if (trunk.bandwidth > 900) return 'HIGH BANDWIDTH';
    }
    return 'UP';
  };

  const getStatusIcon = (status) => {
    if (status === 'up') return '●';
    if (status === 'warning') return '▲';
    return '●';
  };

  const sortedTrunks = [...trunks].sort((a, b) => {
    if (a.status === 'down' && b.status !== 'down') return -1;
    if (a.status !== 'down' && b.status === 'down') return 1;
    if (a.status === 'warning' && b.status === 'up') return -1;
    if (a.status === 'up' && b.status === 'warning') return 1;
    return 0;
  });

  const handleTrunkClick = (trunkId) => {
    navigate(`/trunk/${trunkId}`);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">⬡</div>
            <div className="logo-text">
              <h1>SAT Monitor</h1>
              <span className="company-name">Skywave Technologies</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live</span>
          </div>
          
          <button className="notification-button" onClick={handleNotificationClick}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
          
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-label">Total Trunks</div>
            <div className="card-value">{totalTrunks}</div>
          </div>
          
          <div className="summary-card status-up-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Trunks UP</div>
              <div className="card-value">{trunksUp}</div>
            </div>
          </div>
          
          <div className="summary-card status-down-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Trunks DOWN</div>
              <div className="card-value">{trunksDown}</div>
            </div>
          </div>
          
          <div className="summary-card network-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="20" x2="12.01" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="card-content">
              <div className="card-label">Network Status</div>
              <div className="card-value">{avgLatency}ms</div>
            </div>
          </div>
        </div>

        {/* Trunk Status Table */}
        <div className="trunk-table-container">
<<<<<<< Updated upstream
          <div className="table-header">
            <h2>Active Trunks</h2>
            <div className="table-actions">
              <button className="action-button">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="action-button">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>
            ) : (
              <table className="trunk-table">
                <thead>
                  <tr>
                    <th>Trunk Name</th>
                    <th>PBX</th>
                    <th>Status</th>
                    <th>Latency</th>
                    <th>Last Change</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTrunks.map(trunk => (
                    <tr 
                      key={trunk.id} 
                      className={`trunk-row ${trunk.status}`}
                      onClick={() => handleTrunkClick(trunk)}
                    >
                      <td className="trunk-name">{trunk.name}</td>
                      <td className="trunk-pbx">{trunk.pbx}</td>
                      <td className="trunk-status">
                        <span className={`status-badge ${trunk.status}`}>
                          <span className="status-icon">{getStatusIcon(trunk.status)}</span>
                          {getStatusText(trunk.status)}
                        </span>
                      </td>
                      <td className="trunk-latency">
                        {trunk.latency ? `${trunk.latency}ms` : '—'}
                      </td>
                      <td className="trunk-time">{trunk.lastChanged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
=======
          <h2 className="section-title">Trunk Status</h2>
          <table className="trunk-table">
            <thead>
              <tr>
                <th>Trunk Name</th>
                <th>PBX</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Bandwidth</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrunks.map(trunk => (
                <tr 
                  key={trunk.id} 
                  className={`trunk-row ${getStatusColor(trunk.status)}`}
                  onClick={() => handleTrunkClick(trunk.id)}
                >
                  <td className="trunk-name">{trunk.name}</td>
                  <td className="trunk-pbx">{trunk.pbx}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(trunk.status)}`}>
                      <span className="status-icon">{getStatusIcon(trunk.status)}</span>
                      {getStatusText(trunk)}
                    </span>
                  </td>
                  <td className="trunk-latency">
                    {trunk.latency ? `${trunk.latency}ms` : '—'}
                  </td>
                  <td className="trunk-bandwidth">
                    {trunk.bandwidth ? `${trunk.bandwidth} Kbps` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};

export default Dashboard;