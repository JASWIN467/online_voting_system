const { validationResult } = require('express-validator');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

const getMyVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.user._id })
      .populate('candidateId', 'name party')
      .populate('electionId', 'title startTime endTime')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: votes.length, data: votes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const castVote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    if (req.user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only voter accounts can cast votes',
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const now = new Date();
    const isActive = now >= new Date(election.startTime) && now <= new Date(election.endTime);
    if (!isActive) {
      return res.status(400).json({ success: false, message: 'Election is not active' });
    }

    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Candidate does not belong to this election' });
    }

    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: `You have already voted in this election (vote id: ${existingVote._id})`,
      });
    }

    const vote = await Vote.create({ userId, candidateId, electionId });
    return res.status(201).json({ success: true, message: 'Vote cast successfully', data: vote });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election' });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { castVote, getMyVotes };

