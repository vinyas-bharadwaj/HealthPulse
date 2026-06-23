import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <svg className="nav-brand-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        HealthPulse
      </Link>
      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/inventory" className="nav-link">Inventory</Link>
        
        {user ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <span style={{fontWeight: 600}}>Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{padding: '0.4rem 1rem'}}>Logout</button>
          </div>
        ) : (
          <div style={{display: 'flex', gap: '1rem'}}>
            <Link to="/login" className="btn btn-secondary" style={{padding: '0.4rem 1rem'}}>Sign In</Link>
            <Link to="/register" className="nav-cta">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
