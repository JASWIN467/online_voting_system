import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Vote as VoteIcon } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

const ElectionDetails = () => {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteMessage, setVoteMessage] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/candidates/${id}`);
        setCandidates(data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch candidates');
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, [id]);

  const castVote = async (candidateId) => {
    try {
      await api.post('/vote', { electionId: id, candidateId });
      setVoteMessage('Vote successfully cast!');
      showToast('Vote successfully cast!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cast vote';
      setVoteMessage(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
      <Navbar role="Voter" />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
        <button onClick={() => navigate('/elections')} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>
          ← Back to elections
        </button>
        <h2 style={{ fontSize: '2rem', marginBottom: '18px' }}>Candidates</h2>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading candidates...</p>}
        {!loading && error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        {voteMessage && <p style={{ color: 'var(--accent-primary)', marginBottom: '14px' }}>{voteMessage}</p>}

        <div style={{ display: 'grid', gap: '14px' }}>
          {candidates.map((candidate) => (
            <div key={candidate._id} className="glass-card" style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>{candidate.name}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{candidate.party}</p>
              </div>
              <button className="btn-primary" onClick={() => castVote(candidate._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <VoteIcon size={16} /> Vote
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElectionDetails;

