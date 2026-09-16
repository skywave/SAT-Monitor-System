import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dash.css';
import { getTrunks, getNetworkStatus } from '../../../../services/monitoringService';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [trunks, setTrunks] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    status: 'optimal',
    avgLatency: 0,
    packetLoss: 0
  });
  const [loading, setLoading] = useState(true);
  const [unreadNotifications] = useState(0);

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
  // eslint-disable-next-line no-unused-vars
  const trunksWarning = trunks.filter(t => t.status === 'warning').length;
  const avgLatency = networkStatus.avgLatency;

  const getStatusColor = (status) => {
    if (status === 'up') return 'status-up';
    if (status === 'warning') return 'status-warning';
    return 'status-down';
  };

  const getStatusText = (trunk) => {
    if (trunk.status === 'down') return 'DOWN';
    if (trunk.status === 'warning') return 'HIGH LATENCY';
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

  const handleNetworkClick = () => {
    navigate('/network');
  };

  if (loading && trunks.length === 0) {
    return (
      <div className="dashboard">
        <div style={{textAlign: 'center', padding: '4rem'}}>
          <h2>Loading monitoring data...</h2>
        </div>
      </div>
    );
  }

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
          
          {/* Network Monitoring Button - NEW */}
          <button className="network-button" onClick={handleNetworkClick}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="20" x2="12.01" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Network
          </button>
          
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
              <div className="card-sub">{networkStatus.status}</div>
            </div>
          </div>
        </div>

        {/* Trunk Status Table */}
        <div className="trunk-table-container">
          <h2 className="section-title">Trunk Status</h2>
          <table className="trunk-table">
            <thead>
              <tr>
                <th>Trunk Name</th>
                <th>PBX</th>
                <th>Status</th>
                <th>Last Changed</th>
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
                    {trunk.lastChanged || '—'}
                  </td>
                  <td className="trunk-latency">
                    {trunk.latency ? `${trunk.latency}ms` : 'N/A'}
                  </td>
                  <td className="trunk-bandwidth">
                    N/A
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;