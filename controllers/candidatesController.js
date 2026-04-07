const { validationResult } = require('express-validator');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { logAdminAction } = require('../middleware/auditMiddleware');

const addCandidate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, party, electionId } = req.body;
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

    const candidate = await Candidate.create({ name, party, electionId });

    await logAdminAction({
      adminId: req.user?._id,
      action: 'ADD_CANDIDATE',
      resourceType: 'Candidate',
      resourceId: candidate._id,
      metadata: { name: candidate.name, electionId },
    });

    return res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const hasVotes = await Vote.exists({ electionId: candidate.electionId });
    if (hasVotes) {
      return res.status(400).json({
        success: false,
        message: 'Election is locked because voting has already started',
      });
    }

    await candidate.deleteOne();

    await logAdminAction({
      adminId: req.user?._id,
      action: 'DELETE_CANDIDATE',
      resourceType: 'Candidate',
      resourceId: candidate._id,
      metadata: { name: candidate.name, electionId: candidate.electionId },
    });

    return res.status(200).json({ success: true, message: 'Candidate removed successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addCandidate,
  getCandidatesByElection,
  deleteCandidate,
};

