import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const ElectionCard = ({ election, onViewCandidates }) => {
  const statusColors =
    election.displayStatus === 'Active'
      ? { bg: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', icon: <CheckCircle2 size={14} /> }
      : { bg: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', icon: <AlertCircle size={14} /> };

  return (
    <article
      className="glass-card elevate-on-hover"
      style={{
        padding: '24px',
        borderColor: 'rgba(59, 130, 246, 0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '999px',
            backgroundColor: statusColors.bg,
            color: statusColors.color,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {statusColors.icon}
          {election.displayStatus}
        </div>
        <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{election.title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '18px', minHeight: '44px' }}>{election.description}</p>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Ends: {new Date(election.endTime).toLocaleString()}
        </span>
        <button className="btn-primary" onClick={() => onViewCandidates(election._id)}>
          View Candidates
        </button>
      </div>
    </article>
  );
};

export default ElectionCard;

