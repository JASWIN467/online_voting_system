import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Plus, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('elections');
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newElection, setNewElection] = useState({ title: '', description: '', startTime: '', endTime: '' });
  const [candidateData, setCandidateData] = useState({ name: '', party: '', electionId: '' });
  const [results, setResults] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data } = await api.get('/admin/elections');
      setElections(data.data);
    } catch (err) {
      console.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/elections', newElection);
      setShowModal(false);
      fetchElections();
      setNewElection({ title: '', description: '', startTime: '', endTime: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create election', 'error');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/candidates', candidateData);
      setCandidateData({ name: '', party: '', electionId: '' });
      showToast('Candidate added successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add candidate', 'error');
    }
  };

  const fetchResults = async (electionId) => {
    try {
      const { data } = await api.get(`/admin/elections/${electionId}/results`);
      setResults((prev) => ({ ...prev, [electionId]: data.data }));
    } catch (err) {
      console.error('Failed to fetch results');
      showToast('Failed to fetch results', 'error');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data } = await api.get('/admin/audit-logs');
      setAuditLogs(data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load audit logs', 'error');
    }
  };

  const startElection = async (id) => {
    try {
      const { data } = await api.patch(`/admin/elections/${id}/start`);
      fetchElections();
      showToast(data?.message || 'Election started', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start election', 'error');
    }
  };

  const endElection = async (id) => {
    try {
      await api.patch(`/admin/elections/${id}/end`);
      fetchElections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to end election', 'error');
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to download file', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Navbar role="Administrator" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/admin/charts')}
            style={{ 
              padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: 'var(--bg-surface-light)',
              color: 'white', fontWeight: '700'
            }}
          >
            <BarChart3 size={20} /> Charts
          </button>
          <button 
            onClick={() => setActiveTab('elections')}
            style={{ 
              padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: activeTab === 'elections' ? 'var(--accent-primary)' : 'var(--bg-surface-light)',
              color: 'white', fontWeight: '700'
            }}
          >
            <Settings size={20} /> Manage Elections
          </button>
          <button
            onClick={() => setActiveTab('results')}
            style={{ 
              padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: activeTab === 'results' ? 'var(--accent-primary)' : 'var(--bg-surface-light)',
              color: 'white', fontWeight: '700'
            }}
          >
            <BarChart3 size={20} /> Live Results
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              fetchAuditLogs();
            }}
            style={{
              padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: activeTab === 'audit' ? 'var(--accent-primary)' : 'var(--bg-surface-light)',
              color: 'white', fontWeight: '700'
            }}
          >
            <ShieldCheck size={20} /> Audit Logs
          </button>
        </div>

        {activeTab === 'elections' ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.8rem' }}>Election Management</h2>
              <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} /> Create New Election
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {elections.map(election => (
                <div key={election._id} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{election.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status: <span style={{ color: 'var(--accent-primary)' }}>{election.status}</span></p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => setCandidateData({ ...candidateData, electionId: election._id })}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.85rem' }}
                    >
                      + Add Candidate
                    </button>
                    <button
                      onClick={() => startElection(election._id)}
                      disabled={election.status === 'ended'}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem', opacity: election.status === 'ended' ? 0.6 : 1 }}
                    >
                      {election.status === 'active' ? 'Active' : 'Start'}
                    </button>
                    <button
                      onClick={() => endElection(election._id)}
                      disabled={election.status === 'ended'}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        fontSize: '0.85rem',
                        opacity: election.status === 'ended' ? 0.6 : 1,
                      }}
                    >
                      End
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : activeTab === 'results' ? (
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Real-time Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
              {elections.map(election => (
                <div key={election._id} className="glass-card" style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{election.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => navigate(`/admin/elections/${election._id}/analytics`)} style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '700' }}>View Analytics</button>
                      <button onClick={() => fetchResults(election._id)} style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Refresh</button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {results[election._id]?.turnout && (
                      <div className="glass-card" style={{ padding: '12px', background: 'rgba(79, 124, 255, 0.12)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          Turnout: <strong style={{ color: 'white' }}>{results[election._id].turnout.totalVotes}</strong> / {results[election._id].turnout.totalVoters} voters
                          {' '}({results[election._id].turnout.turnoutPct}%)
                        </p>
                      </div>
                    )}

                    {results[election._id]?.results?.length > 0 && (() => {
                      const maxVotes = Math.max(...results[election._id].results.map((r) => r.votes), 0);
                      return results[election._id].results.map((res) => (
                        <div key={res.candidateId}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span>{res.name} ({res.party})</span>
                            <span style={{ fontWeight: '800' }}>{res.votes} votes</span>
                          </div>
                          <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${maxVotes > 0 ? (res.votes / maxVotes) * 100 : 0}%`,
                                minWidth: res.votes > 0 ? '8px' : 0,
                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '4px',
                                transition: 'width 1s ease-out',
                              }}
                            ></div>
                          </div>
                        </div>
                      ));
                    })()}

                    {results[election._id]?.results?.length === 0 && (
                      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                        No candidates found for this election.
                      </p>
                    )}
                    {!results[election._id] && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>Click refresh to view current standings</p>}
                    {results[election._id] && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                          onClick={() => downloadFile(`/admin/elections/${election._id}/export.csv`, `${election.title}-results.csv`)}
                        >
                          Export CSV
                        </button>
                        <button
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }}
                          onClick={() => downloadFile(`/admin/elections/${election._id}/export.pdf`, `${election.title}-results.pdf`)}
                        >
                          Export PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem' }}>Admin Audit Logs</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => downloadFile('/admin/audit-logs/export.csv', 'audit-logs.csv')}>
                  Export CSV
                </button>
                <button style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }} onClick={() => downloadFile('/admin/audit-logs/export.pdf', 'audit-logs.pdf')}>
                  Export PDF
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {auditLogs.length === 0 && (
                <div className="glass-card" style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  No audit logs yet.
                </div>
              )}
              {auditLogs.map((log) => (
                <div key={log._id} className="glass-card" style={{ padding: '14px 16px' }}>
                  <p style={{ fontWeight: 700 }}>
                    {log.action} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>on {log.resourceType}</span>
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    By: {log.adminId?.username || 'admin'} | {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Create Election Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '40px' }}>
            <h2 style={{ marginBottom: '24px' }}>New Election</h2>
            <form onSubmit={handleCreateElection}>
              <div className="input-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Title</label>
                <input type="text" className="input-field" required value={newElection.title} onChange={e => setNewElection({ ...newElection, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Description</label>
                <textarea className="input-field" style={{ minHeight: '80px' }} required value={newElection.description} onChange={e => setNewElection({ ...newElection, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Start Time</label>
                  <input type="datetime-local" className="input-field" required value={newElection.startTime} onChange={e => setNewElection({ ...newElection, startTime: e.target.value })} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>End Time</label>
                  <input type="datetime-local" className="input-field" required value={newElection.endTime} onChange={e => setNewElection({ ...newElection, endTime: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Create Election</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Mini Modal (Inline conditional) */}
      {candidateData.electionId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Add Candidate</h2>
            <form onSubmit={handleAddCandidate}>
              <div className="input-group">
                <input type="text" placeholder="Candidate Name" className="input-field" required value={candidateData.name} onChange={e => setCandidateData({ ...candidateData, name: e.target.value })} />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Party Name" className="input-field" required value={candidateData.party} onChange={e => setCandidateData({ ...candidateData, party: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setCandidateData({ name: '', party: '', electionId: '' })} style={{ flex: 1, color: 'var(--text-secondary)' }}>Back</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Add Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
