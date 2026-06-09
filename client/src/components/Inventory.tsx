import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Transaction {
  id: number;
  analysis_id: number | null;
  sender_hospital_id: number;
  receiver_hospital_id: number;
  item_name: string;
  quantity: number;
  status: string;
  timestamp: string;
}

const Inventory: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetch('/transactions/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Sort by newest first
        const sorted = data.sort((a: Transaction, b: Transaction) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setTransactions(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Inventory Transactions log</h2>
        <p>A history of all manual and AI-driven supply transfers.</p>
      </div>

      <div className="transactions-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Sender ID</th>
              <th>Receiver ID</th>
              <th>Analysis Run</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No transactions found.</td>
              </tr>
            ) : (
              transactions.map(tx => (
                <tr key={tx.id}>
                  <td>#{tx.id}</td>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>{tx.item_name.replace(/_/g, ' ')}</td>
                  <td><strong>{tx.quantity}</strong></td>
                  <td>{tx.sender_hospital_id}</td>
                  <td>{tx.receiver_hospital_id}</td>
                  <td>{tx.analysis_id ? `#${tx.analysis_id}` : 'Manual'}</td>
                  <td>
                    <span className={`status-badge small ${tx.status}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
