import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ElectionCard from '../components/ElectionCard';
import api from '../utils/api';

const Elections = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadElections = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/elections');
        setElections(data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load elections.');
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, []);

  const activeElections = useMemo(() => {
    const now = Date.now();
    return elections
      .filter((e) => new Date(e.startTime).getTime() <= now && new Date(e.endTime).getTime() >= now)
      .map((e) => ({
        ...e,
        displayStatus: new Date(e.endTime).getTime() >= now ? 'Active' : 'Ended',
      }));
  }, [elections]);

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', paddingBottom: '40px' }}>
      <Navbar role="Voter" />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <header className="glass-card" style={{ marginBottom: '26px', padding: '26px' }}>
          <h1 style={{ fontSize: '2.3rem', marginBottom: '6px' }}>
            Live <span className="gradient-text">Elections</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse active elections and open candidate lists.</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/my-votes')}
            style={{ marginTop: '14px' }}
          >
            My Votes
          </button>
        </header>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px', color: 'var(--text-secondary)' }}>
            <span className="loader" />
            Loading elections...
          </div>
        )}

        {!loading && error && (
          <div className="glass-card elevate-on-hover" style={{ padding: '16px', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {!loading && !error && activeElections.length === 0 && (
          <div className="glass-card elevate-on-hover" style={{ padding: '18px', color: 'var(--text-secondary)' }}>
            No active elections available
          </div>
        )}

        {!loading && !error && activeElections.length > 0 && (
          <section style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {activeElections.map((election) => (
              <ElectionCard
                key={election._id}
                election={election}
                onViewCandidates={(id) => navigate(`/election/${id}`)}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default Elections;

