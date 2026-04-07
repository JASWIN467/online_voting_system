import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        setError(errors[0].msg || 'Registration failed.');
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page auth-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
      <div className="auth-hero" style={{ 
        flex: 1, 
        background: 'linear-gradient(145deg, rgba(20,29,52,0.8), rgba(8,10,18,0.92))',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', borderRight: '1px solid var(--glass-border)'
      }}>
        <div className="hero-glow" style={{ background: 'var(--bg-surface-light)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
          <ShieldCheck size={64} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>Join the <span className="gradient-text">Future</span></h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '1.1rem', textAlign: 'center' }}>
          Create an account to securely participate in active elections or manage them.
        </p>
      </div>

      <div className="auth-form-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div className="glass-card elevate-on-hover" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Fill in the details below to get started</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="jaswin_voter"
                  style={{ paddingLeft: '44px' }}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '44px' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-6px', marginBottom: '12px' }}>
              Registration creates a <strong>voter</strong> account. Admins must be created by the system.
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
