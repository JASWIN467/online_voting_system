import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import api from '../utils/api';

const CustomValueLabel = ({ x, y, width, value, payload }) => {
  if (value == null) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#e5e7eb"
      textAnchor="middle"
      fontSize={11}
    >
      {`${value} (${payload?.percentage ?? 0}%)`}
    </text>
  );
};

const ResultsChart = ({ electionId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!electionId) return;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/results/${electionId}`);
        const payload = res.data?.data || res.data;
        const raw = Array.isArray(payload)
          ? payload
          : payload?.results || [];

        const mapped = raw.map((row) => ({
          candidateName: row.candidateName || row.name,
          votes: row.votes ?? row.voteCount ?? 0,
        }));

        mapped.sort((a, b) => b.votes - a.votes);
        const totalVotes = mapped.reduce((sum, r) => sum + r.votes, 0);
        const enriched = mapped.map((r, idx) => ({
          ...r,
          percentage: totalVotes > 0 ? Number(((r.votes / totalVotes) * 100).toFixed(1)) : 0,
          isLeader: idx === 0,
        }));
        setData(enriched);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [electionId]);

  const maxVotes = useMemo(
    () => data.reduce((max, r) => Math.max(max, r.votes), 0),
    [data]
  );

  if (!electionId) {
    return <p style={{ color: 'var(--text-secondary)' }}>Select an election to see chart.</p>;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
        <span className="loader" /> Loading results chart...
      </div>
    );
  }

  if (error) {
    return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  }

  if (data.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>No results available for this election.</p>;
  }

  const barData = data.map((row) => ({
    ...row,
    fill: row.isLeader ? 'url(#leaderGradient)' : 'url(#normalGradient)',
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
          <defs>
            <linearGradient id="leaderGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="normalGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="candidateName"
            tick={{ fill: '#a3acc2', fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: '#a3acc2', fontSize: 11 }}
            allowDecimals={false}
            domain={[0, maxVotes || 1]}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.08)' }}
            contentStyle={{
              background: '#020617',
              border: '1px solid rgba(148,163,184,0.4)',
              borderRadius: 8,
              color: 'white',
            }}
            formatter={(value, name, props) => {
              if (name === 'votes') {
                const pct = props.payload.percentage;
                return [`${value} votes (${pct}%)`, 'Votes'];
              }
              return [value, name];
            }}
          />
          <Bar
            dataKey="votes"
            animationDuration={800}
            radius={[6, 6, 0, 0]}
            isAnimationActive
          >
            <LabelList
              dataKey="votes"
              position="top"
              content={<CustomValueLabel />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;

