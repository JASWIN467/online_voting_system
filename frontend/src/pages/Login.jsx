import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));

      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page auth-shell" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-deep)' 
    }}>
      {/* Left Side: Branding (Visible on desktop) */}
      <div className="auth-hero" style={{ 
        flex: 1, 
        background: 'linear-gradient(145deg, rgba(20,29,52,0.8), rgba(8,10,18,0.92))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        borderRight: '1px solid var(--glass-border)',
        textAlign: 'center'
      }}>
        <div className="hero-glow" style={{ background: 'var(--bg-surface-light)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
          <ShieldCheck size={64} className="gradient-text" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>Secure<span className="gradient-text">Vote</span></h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '1.1rem' }}>
          Experience the future of democracy with our encrypted, transparent, and user-centric voting platform.
        </p>
      </div>

      {/* Right Side: Form */}
      <div className="auth-form-container" style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px' 
      }}>
        <div className="glass-card elevate-on-hover" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Enter your credentials to access the portal</p>
          <p style={{ color: 'rgba(163,172,194,0.8)', marginBottom: '32px', fontSize: '0.82rem' }}>
            Login with your role account. Register creates voter accounts.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>User Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="username"
                  style={{ paddingLeft: '44px' }}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="password"
                  style={{ paddingLeft: '44px' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Login to Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
