import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ 
      height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'var(--bg-deep)', color: 'white', textAlign: 'center', padding: '20px'
    }}>
      <ShieldAlert size={80} style={{ color: 'var(--danger)', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '16px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', color: 'var(--text-secondary)' }}>Unauthorized Access or Page Not Found</h2>
      <Link to="/login" className="btn-primary">Return to Secure Portal</Link>
    </div>
  );
};

export default NotFound;
