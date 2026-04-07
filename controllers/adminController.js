const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');
const { logAdminAction } = require('../middleware/auditMiddleware');

const getTimedStatus = (election) => {
  const now = new Date();
  if (now < new Date(election.startTime)) return 'upcoming';
  if (now > new Date(election.endTime)) return 'ended';
  return 'active';
};

const buildElectionAnalytics = async (electionId) => {
  const election = await Election.findById(electionId);
  if (!election) return null;

  const voteAgg = await Vote.aggregate([
    { $match: { electionId: election._id } },
    { $group: { _id: '$candidateId', votes: { $sum: 1 } } },
  ]);

  const candidates = await Candidate.find({ electionId: election._id }).select('name party');
  const voteMap = new Map(voteAgg.map((row) => [String(row._id), row.votes]));
  const results = candidates
    .map((candidate) => ({
      candidateId: candidate._id,
      name: candidate.name,
      party: candidate.party,
      votes: voteMap.get(String(candidate._id)) || 0,
    }))
    .sort((a, b) => (b.votes - a.votes) || a.name.localeCompare(b.name));

  const totalVotes = results.reduce((sum, row) => sum + row.votes, 0);
  const totalVoters = await User.countDocuments({ role: 'user' });
  const turnoutPct = totalVoters > 0 ? Number(((totalVotes / totalVoters) * 100).toFixed(2)) : 0;

  const top = results[0] || null;
  const second = results[1] || null;
  const winner = top
    ? {
        ...top,
        sharePct: totalVotes > 0 ? Number(((top.votes / totalVotes) * 100).toFixed(2)) : 0,
      }
    : null;
  const marginVotes = top && second ? top.votes - second.votes : top ? top.votes : 0;
  const marginPct = totalVotes > 0 ? Number(((marginVotes / totalVotes) * 100).toFixed(2)) : 0;

  const resultsWithShare = results.map((row) => ({
    ...row,
    sharePct: totalVotes > 0 ? Number(((row.votes / totalVotes) * 100).toFixed(2)) : 0,
  }));

  const trendAgg = await Vote.aggregate([
    { $match: { electionId: election._id } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' },
        },
        votes: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
  ]);

  let cumulative = 0;
  const turnoutTrend = trendAgg.map((point) => {
    cumulative += point.votes;
    const date = new Date(Date.UTC(point._id.year, point._id.month - 1, point._id.day, point._id.hour));
    return {
      bucket: date.toISOString(),
      votes: point.votes,
      cumulativeVotes: cumulative,
    };
  });

  return {
    election: {
      _id: election._id,
      title: election.title,
      status: election.status,
      startTime: election.startTime,
      endTime: election.endTime,
    },
    turnout: { totalVoters, totalVotes, turnoutPct },
    winner,
    margin: { marginVotes, marginPct },
    results: resultsWithShare,
    turnoutTrend,
  };
};

const listElections = async (req, res) => {
  try {
    const elections = await Election.find({}).sort({ createdAt: -1 });
    await Promise.all(
      elections.map(async (election) => {
        const nextStatus = getTimedStatus(election);
        if (election.status !== nextStatus) {
          election.status = nextStatus;
          election.isActive = nextStatus === 'active';
          await election.save();
        }
      })
    );
    res.status(200).json({ success: true, count: elections.length, data: elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new election
// @route   POST /api/admin/elections
// @access  Private/Admin
const createElection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { title, description, startTime, endTime } = req.body;
    const election = await Election.create({
      title,
      description,
      startTime,
      endTime,
    });
    await logAdminAction({
      adminId: req.user?._id,
      action: 'CREATE_ELECTION',
      resourceType: 'Election',
      resourceId: election._id,
      metadata: { title: election.title },
    });
    res.status(201).json({ success: true, data: election });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add candidate to election
// @route   POST /api/admin/candidates
// @access  Private/Admin
const addCandidate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, party, electionId } = req.body;
    
    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const hasVotes = await Vote.exists({ electionId });
    if (hasVotes) {
      return res.status(400).json({
        success: false,
        message: 'Election is locked because voting has already started',
      });
    }

    const candidate = await Candidate.create({
      name,
      party,
      electionId,
    });
    await logAdminAction({
      adminId: req.user?._id,
      action: 'ADD_CANDIDATE',
      resourceType: 'Candidate',
      resourceId: candidate._id,
      metadata: { name: candidate.name, electionId },
    });
    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all election results
// @route   GET /api/admin/elections/:id/results
// @access  Private/Admin
const getElectionResults = async (req, res) => {
  try {
    const electionId = req.params.id;
    const analytics = await buildElectionAnalytics(electionId);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...analytics,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (election.status === 'active') {
      return res.status(200).json({
        success: true,
        message: 'Election is already active',
        data: election,
      });
    }

    const now = new Date();
    if (now >= election.endTime) {
      return res.status(400).json({ success: false, message: 'Election endTime has already passed' });
    }
    if (election.status === 'ended') {
      return res.status(400).json({ success: false, message: 'Election already ended' });
    }

    election.status = 'active';
    await election.save();
    await logAdminAction({
      adminId: req.user?._id,
      action: 'START_ELECTION',
      resourceType: 'Election',
      resourceId: election._id,
      metadata: { title: election.title },
    });
    res.status(200).json({ success: true, data: election });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const endElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    if (election.status === 'ended') {
      return res.status(400).json({ success: false, message: 'Election already ended' });
    }

    election.status = 'ended';
    await election.save();
    await logAdminAction({
      adminId: req.user?._id,
      action: 'END_ELECTION',
      resourceType: 'Election',
      resourceId: election._id,
      metadata: { title: election.title },
    });
    res.status(200).json({ success: true, data: election });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('adminId', 'username email')
      .sort({ createdAt: -1 })
      .limit(200);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getElectionAnalytics = async (req, res) => {
  try {
    const analytics = await buildElectionAnalytics(req.params.id);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportElectionCsv = async (req, res) => {
  try {
    const analytics = await buildElectionAnalytics(req.params.id);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const header = 'Candidate,Party,Votes,Share%\n';
    const rows = analytics.results
      .map((r) => `"${r.name}","${r.party}",${r.votes},${r.sharePct}`)
      .join('\n');
    const meta = `\n\nElection,${analytics.election.title}\nTotal Voters,${analytics.turnout.totalVoters}\nTotal Votes,${analytics.turnout.totalVotes}\nTurnout %,${analytics.turnout.turnoutPct}\n`;
    const csv = header + rows + meta;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="election-${analytics.election._id}-results.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const exportElectionPdf = async (req, res) => {
  try {
    const analytics = await buildElectionAnalytics(req.params.id);
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="election-${analytics.election._id}-results.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text(`Election Report: ${analytics.election.title}`);
    doc.moveDown();
    doc.fontSize(12).text(`Status: ${analytics.election.status}`);
    doc.text(`Total Voters: ${analytics.turnout.totalVoters}`);
    doc.text(`Total Votes: ${analytics.turnout.totalVotes}`);
    doc.text(`Turnout: ${analytics.turnout.turnoutPct}%`);
    doc.moveDown();
    doc.fontSize(14).text('Candidate Results');
    doc.moveDown(0.5);
    analytics.results.forEach((row, idx) => {
      doc.fontSize(11).text(`${idx + 1}. ${row.name} (${row.party}) - ${row.votes} votes (${row.sharePct}%)`);
    });
    doc.moveDown();
    if (analytics.winner) {
      doc.fontSize(12).text(`Winner: ${analytics.winner.name}`);
      doc.text(`Margin: ${analytics.margin.marginVotes} votes (${analytics.margin.marginPct}%)`);
    }
    doc.end();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const exportAuditLogsCsv = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('adminId', 'username')
      .sort({ createdAt: -1 })
      .limit(500);
    const header = 'Timestamp,Admin,Action,ResourceType,ResourceId\n';
    const rows = logs
      .map((log) => `"${new Date(log.createdAt).toISOString()}","${log.adminId?.username || 'admin'}","${log.action}","${log.resourceType}","${log.resourceId || ''}"`)
      .join('\n');
    const csv = header + rows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const exportAuditLogsPdf = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('adminId', 'username')
      .sort({ createdAt: -1 })
      .limit(300);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.pdf"');
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text('Admin Audit Logs');
    doc.moveDown();
    logs.forEach((log, index) => {
      doc.fontSize(10).text(
        `${index + 1}. ${new Date(log.createdAt).toLocaleString()} | ${log.adminId?.username || 'admin'} | ${log.action} | ${log.resourceType}`
      );
    });
    doc.end();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listElections,
  createElection,
  addCandidate,
  getElectionResults,
  startElection,
  endElection,
  getAuditLogs,
  getElectionAnalytics,
  exportElectionCsv,
  exportElectionPdf,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
};
