import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useToast } from '../components/ToastProvider';

const AdminElectionAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/elections/${id}/analytics`);
        setData(res.data.data);
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, showToast]);

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', paddingBottom: '30px' }}>
      <Navbar role="Administrator" />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
        <button className="btn-primary" onClick={() => navigate('/admin')} style={{ marginBottom: '16px' }}>
          Back to Admin
        </button>
        <div className="glass-card" style={{ padding: '22px', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '2rem' }}>
            Election Analytics: <span className="gradient-text">{data?.election?.title || '...'}</span>
          </h1>
        </div>

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span className="loader" /> Loading analytics...
          </div>
        )}

        {!loading && data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '12px', marginBottom: '18px' }}>
              <div className="glass-card" style={{ padding: '14px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Winner</p>
                <h3>{data.winner ? `${data.winner.name} (${data.winner.sharePct}%)` : 'No winner yet'}</h3>
              </div>
              <div className="glass-card" style={{ padding: '14px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Margin</p>
                <h3>{data.margin.marginVotes} votes ({data.margin.marginPct}%)</h3>
              </div>
              <div className="glass-card" style={{ padding: '14px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Turnout</p>
                <h3>{data.turnout.totalVotes}/{data.turnout.totalVoters} ({data.turnout.turnoutPct}%)</h3>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '10px' }}>Candidate Share %</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {data.results.map((r) => (
                  <div key={r.candidateId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <span>{r.name}</span>
                      <span>{r.sharePct}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${r.sharePct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Turnout Trend (Hourly)</h3>
              {data.turnoutTrend.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No votes yet.</p>}
              {data.turnoutTrend.length > 0 && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {data.turnoutTrend.map((point) => (
                    <div key={point.bucket} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>{new Date(point.bucket).toLocaleString()}</span>
                      <span>+{point.votes} (total {point.cumulativeVotes})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminElectionAnalytics;

