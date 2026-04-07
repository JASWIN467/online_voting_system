import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ShieldCheck } from 'lucide-react';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ 
      margin: '20px', 
      padding: '12px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck className="gradient-text" size={28} />
        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>Secure<span className="gradient-text">Vote</span></span>
        <span style={{ 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          color: 'var(--accent-primary)', 
          fontSize: '0.7rem', 
          padding: '2px 8px', 
          borderRadius: '100px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginLeft: '8px'
        }}>
          {role}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
          <User size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user?.username}</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--danger)', 
            fontSize: '0.9rem', 
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
