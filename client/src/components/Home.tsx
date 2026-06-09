import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Intelligent Resource <br />
          <span>Allocation</span> for Healthcare
        </h1>
        <p className="hero-subtitle">
          HealthPulse predicts and balances critical medical supplies across hospitals using real-time data, AI analysis, and intelligent routing to prevent shortages.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary">Run Analysis</button>
          <button className="btn btn-secondary">View Network</button>
        </div>
      </div>
      
      <div className="hero-image-container">
        <div className="pulse-ring"></div>
        <div className="hero-card">
          <div className="card-header">
            <div className="status-indicator"></div>
            <div className="card-title">Network Status: Optimal</div>
          </div>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">142</div>
              <div className="stat-label">Hospitals Connected</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">12k</div>
              <div className="stat-label">Critical Items Tracked</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">84</div>
              <div className="stat-label">Pending Transfers</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">98%</div>
              <div className="stat-label">Supply Fulfillment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
