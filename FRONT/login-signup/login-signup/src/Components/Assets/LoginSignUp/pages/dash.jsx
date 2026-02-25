import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dash.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - replace with real API calls
  const [trunks, setTrunks] = useState([
    {
      id: 1,
      name: 'MTN SIP',
      pbx: 'PBX1',
      status: 'up',
      latency: 23,
      lastChanged: '2 mins ago'
    },
    {
      id: 2,
      name: 'Airtel',
      pbx: 'PBX2',
      status: 'down',
      latency: null,
      lastChanged: '10 secs ago'
    },
    {
      id: 3,
      name: 'Zamtel Primary',
      pbx: 'PBX1',
      status: 'up',
      latency: 18,
      lastChanged: '5 mins ago'
    },
    {
      id: 4,
      name: 'Zamtel Backup',
      pbx: 'PBX3',
      status: 'warning',
      latency: 156,
      lastChanged: '1 min ago'
    },
    {
      id: 5,
      name: 'Orange SIP',
      pbx: 'PBX2',
      status: 'up',
      latency: 31,
      lastChanged: '3 mins ago'
    },
    {
      id: 6,
      name: 'MTN Backup',
      pbx: 'PBX3',
      status: 'up',
      latency: 27,
      lastChanged: '4 mins ago'
    },
    {
      id: 7,
      name: 'Liquid SIP',
      pbx: 'PBX1',
      status: 'up',
      latency: 42,
      lastChanged: '1 min ago'
    },
    {
      id: 8,
      name: 'TopStar',
      pbx: 'PBX2',
      status: 'up',
      latency: 35,
      lastChanged: '6 mins ago'
    }
  ]);

  const [networkStatus, setNetworkStatus] = useState({
    status: 'optimal',
    avgLatency: 33,
    packetLoss: 0
  });

  // Calculate stats
  const totalTrunks = trunks.length;
  const trunksUp = trunks.filter(t => t.status === 'up').length;
  const trunksDown = trunks.filter(t => t.status === 'down').length;
  const trunksWarning = trunks.filter(t => t.status === 'warning').length;

  // Sort trunks: DOWN -> WARNING -> UP
  const sortedTrunks = [...trunks].sort((a, b) => {
    const statusPriority = { down: 0, warning: 1, up: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  // Handle row click
  const handleTrunkClick = (trunk) => {
    console.log('Trunk clicked:', trunk);
    // Navigate to trunk details page
    // navigate(`/trunk/${trunk.id}`);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear any stored tokens/session data here
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'up':
        return '●';
      case 'down':
        return '●';
      case 'warning':
        return '●';
      default:
        return '●';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'up':
        return 'UP';
      case 'down':
        return 'DOWN';
      case 'warning':
        return 'HIGH LATENCY';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1>SAT Monitor</h1>
              <span className="subtitle">Skywave Technologies</span>
            </div>
          </div>
          <div className="user-section">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Live</span>
            </div>
            <button className="user-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card">
            <div className="card-label">Total Trunks</div>
            <div className="card-value">{totalTrunks}</div>
          </div>

          <div className="status-card status-up">
            <div className="card-label">Trunks UP</div>
            <div className="card-value">
              <span className="status-icon up">●</span>
              {trunksUp}
            </div>
          </div>

          <div className="status-card status-down">
            <div className="card-label">Trunks DOWN</div>
            <div className="card-value">
              <span className="status-icon down">●</span>
              {trunksDown}
            </div>
          </div>

          <div className={`status-card status-network ${networkStatus.status}`}>
            <div className="card-label">Network Status</div>
            <div className="card-value">
              <span className="status-icon network">●</span>
              {networkStatus.avgLatency}ms
            </div>
          </div>
        </div>

        {/* Trunk Table */}
        <div className="trunk-table-container">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
