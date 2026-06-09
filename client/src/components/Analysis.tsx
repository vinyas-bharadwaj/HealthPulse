import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface TransactionDetail {
  sender: string;
  receiver: string;
  item: string;
  quantity: number;
}

interface AnalysisGenerateResponse {
  analysis_id: number;
  high_level_overview: string;
  transactions: TransactionDetail[];
}

const Analysis: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const [newsContext, setNewsContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisGenerateResponse | null>(null);
  const [actionStatus, setActionStatus] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [actionMessage, setActionMessage] = useState('');

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsContext) return;
    
    setLoading(true);
    setResult(null);
    setActionStatus('pending');
    setActionMessage('');

    try {
      const res = await fetch('/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ news_context: newsContext })
      });

      if (!res.ok) throw new Error('Analysis generation failed');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Error generating analysis. Make sure the API key is configured properly.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'decline') => {
    if (!result) return;
    
    try {
      const res = await fetch(`/analysis/${result.analysis_id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error(`Failed to ${action}`);
      
      const data = await res.json();
      setActionStatus(action);
      setActionMessage(data.message);
    } catch (err) {
      console.error(err);
      alert(`Error trying to ${action}`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>AI Resource Analysis</h2>
        <p>Input real-world news or events to proactively reallocate medical supplies.</p>
      </div>

      <div className="analysis-card">
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Current Event Context</label>
            <textarea 
              rows={5}
              placeholder="e.g. A severe earthquake has struck City X, expecting hundreds of casualties..."
              value={newsContext}
              onChange={e => setNewsContext(e.target.value)}
              className="analysis-textarea"
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Generate Reallocation Strategy'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-container" style={{height: '30vh'}}>
          <div className="loader"></div>
          <p>AI is analyzing context and current hospital inventory...</p>
        </div>
      )}

      {result && (
        <div className="analysis-result-card">
          <div className="analysis-result-header">
            <h3>Analysis Report</h3>
            <span className={`status-badge ${actionStatus}`}>{actionStatus.toUpperCase()}</span>
          </div>

          <div className="overview-section">
            <h4>Strategy Overview</h4>
            <p>{result.high_level_overview}</p>
          </div>

          <div className="transactions-section">
            <h4>Proposed Transactions</h4>
            {result.transactions.length === 0 ? (
              <p className="text-muted">No transactions recommended based on current inventory and context.</p>
            ) : (
              <div className="tx-list">
                {result.transactions.map((tx, idx) => (
                  <div key={idx} className="tx-item">
                    <div className="tx-icon">⇌</div>
                    <div className="tx-details">
                      <strong>{tx.quantity}x {tx.item.replace(/_/g, ' ')}</strong>
                      <span>From {tx.sender} to {tx.receiver}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {actionStatus === 'pending' && result.transactions.length > 0 && (
            <div className="analysis-actions">
              <button className="btn btn-secondary" onClick={() => handleAction('decline')}>Decline All</button>
              <button className="btn btn-primary" onClick={() => handleAction('approve')}>Approve & Execute</button>
            </div>
          )}

          {actionMessage && (
            <div className={`action-message ${actionStatus}`}>
              {actionMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
