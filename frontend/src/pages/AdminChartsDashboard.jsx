import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import ResultsChart from '../components/ResultsChart';

const AdminChartsDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/elections');
        setElections(data.data || []);
        if (data.data?.length) {
          setSelectedId(data.data[0]._id);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="auth-shell" style={{ minHeight: '100vh', paddingBottom: '30px' }}>
      <Navbar role="Administrator" />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem' }}>
            Results <span className="gradient-text">Bar Chart</span> Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Visualize vote distribution per candidate for any election.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <span className="loader" /> Loading elections...
          </div>
        ) : (
          <>
            <div className="glass-card" style={{ padding: '16px', marginBottom: '18px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginRight: '8px' }}>
                Select Election:
              </label>
              <select
                className="input-field"
                style={{ maxWidth: '320px', display: 'inline-block' }}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {elections.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <ResultsChart electionId={selectedId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChartsDashboard;

