const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');

// @desc    Get all available elections
// @route   GET /api/voter/elections
// @access  Private/User
const getElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gt: now },
    }).sort({ startTime: 1 });
    res.status(200).json({ success: true, count: elections.length, data: elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get candidates for a specific election
// @route   GET /api/voter/elections/:id/candidates
// @access  Private/User
const getElectionCandidates = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const now = new Date();
    if (election.status !== 'active' || now < election.startTime || now >= election.endTime) {
      return res.status(400).json({ success: false, message: 'Election is not currently active' });
    }

    const candidates = await Candidate.find({ electionId: req.params.id });
    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cast a vote
// @route   POST /api/voter/vote
// @access  Private/User
const castVote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { electionId, candidateId } = req.body;
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate for the provided election',
      });
    }

    const vote = await Vote.create({
      userId,
      electionId,
      candidateId,
    });

    res.status(201).json({ success: true, message: 'Vote successful', data: vote });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getElections,
  getElectionCandidates,
  castVote,
};
