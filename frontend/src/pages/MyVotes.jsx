import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const MyVotes = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVotes = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/vote/me');
        setVotes(data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your voting history.');
      } finally {
        setLoading(false);
      }
    };
    loadVotes();
  }, []);

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', paddingBottom: '30px' }}>
      <Navbar role="Voter" />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <button className="btn-primary" onClick={() => navigate('/elections')} style={{ marginBottom: '18px' }}>
          Back to Elections
        </button>

        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>
            My <span className="gradient-text">Votes</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your voting history across elections.</p>
        </div>

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span className="loader" /> Loading vote history...
          </div>
        )}

        {!loading && error && <div className="glass-card" style={{ padding: '16px', color: 'var(--danger)' }}>{error}</div>}

        {!loading && !error && votes.length === 0 && (
          <div className="glass-card" style={{ padding: '16px', color: 'var(--text-secondary)' }}>
            You have not voted in any election yet.
          </div>
        )}

        {!loading && !error && votes.length > 0 && (
          <div style={{ display: 'grid', gap: '14px' }}>
            {votes.map((vote) => (
              <div key={vote._id} className="glass-card elevate-on-hover" style={{ padding: '18px' }}>
                <h3 style={{ marginBottom: '6px' }}>{vote.electionId?.title || 'Election'}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Candidate: {vote.candidateId?.name || 'Unknown'} ({vote.candidateId?.party || 'N/A'})
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Voted at: {new Date(vote.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVotes;

