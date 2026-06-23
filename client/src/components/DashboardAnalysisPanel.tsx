import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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

interface DashboardAnalysisPanelProps {
  onDataChange?: () => void;
}

const DashboardAnalysisPanel: React.FC<DashboardAnalysisPanelProps> = ({ onDataChange }) => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisGenerateResponse | null>(null);
  const [actionStatus, setActionStatus] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [notification, setNotification] = useState('');
  
  // Initial fetch of latest analysis
  useEffect(() => {
    fetchLatestAnalysis();
  }, [token]);

  const fetchLatestAnalysis = async () => {
    try {
      const res = await fetch('/analysis/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        // We only show pending if we haven't seen it approved/declined
        // Since backend doesn't return the status in this payload, we assume pending if new
        setActionStatus('pending');
      }
    } catch (e) {
      // no latest analysis found yet
    }
  };

  const handleManualRun = async () => {
    setLoading(true);
    try {
      const res = await fetch('/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ news_context: "" })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setActionStatus('pending');
      }
    } catch (err) {
      alert('Error triggering analysis.');
    } finally {
      setLoading(false);
    }
  };



  const handleAction = async (action: 'approve' | 'decline') => {
    if (!result) return;
    try {
      const res = await fetch(`/analysis/${result.analysis_id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionStatus(action);
        if (action === 'approve') {
          alert('✅ Success! Transfers have been routed and executed across the network.');
          setNotification('✅ Transfers successfully routed and executed!');
          if (onDataChange) {
            onDataChange();
          }
          setTimeout(() => setNotification(''), 4000);
        }
      }
    } catch (err) {
      alert(`Error trying to ${action}`);
    }
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.90)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{ ...glassStyle, position: 'relative', width: '100%', height: '100%', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%' }}></span>
          AI Logistics Manager
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.9rem' }}>
            AI is scanning live news and optimizing logistics...
          </div>
        ) : result ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#c8102e', textTransform: 'uppercase' }}>Strategy Overview</strong>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', margin: '4px 0 0 0' }}>{result.high_level_overview}</p>
            </div>
            
            <strong style={{ fontSize: '0.85rem', color: '#c8102e', textTransform: 'uppercase' }}>Pending Transactions</strong>
            {result.transactions.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No transfers necessary at this time.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {result.transactions.map((tx, idx) => (
                  <div key={idx} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{tx.quantity}x {tx.item.replace(/_/g, ' ')}</div>
                    <div style={{ color: '#64748b', marginTop: '4px' }}>{tx.sender} ➔ {tx.receiver}</div>
                  </div>
                ))}
              </div>
            )}
            
            {actionStatus === 'pending' && result.transactions.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => handleAction('decline')} style={{ flex: 1, padding: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Decline</button>
                <button onClick={() => handleAction('approve')} style={{ flex: 1, padding: '8px', backgroundColor: '#c8102e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
              </div>
            )}
            
            {actionStatus !== 'pending' && (
              <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', color: actionStatus === 'approved' ? '#10b981' : '#ef4444' }}>
                Analysis {actionStatus.toUpperCase()}
              </div>
            )}
            
            {notification && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.9rem', fontWeight: 'bold', animation: 'fadeIn 0.3s ease-out' }}>
                {notification}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.9rem' }}>
            No recent analysis found. Trigger an analysis manually.
          </div>
        )}
      </div>

      {!loading && (
        <button 
          onClick={handleManualRun}
          style={{ width: '100%', padding: '10px', marginTop: '16px', backgroundColor: '#c8102e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
        >
          Run Analysis
        </button>
      )}
    </div>
  );
};

export default DashboardAnalysisPanel;
