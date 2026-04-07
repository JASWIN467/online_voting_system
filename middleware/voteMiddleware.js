const Election = require('../models/Election');
const Vote = require('../models/Vote');

// Check if election is currently active
const validateVotingWindow = async (req, res, next) => {
  try {
    const electionId = req.body.electionId || req.params.electionId;
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const now = new Date();

    if (now < election.startTime) {
      return res.status(400).json({ success: false, message: 'Election has not started yet' });
    }

    if (now > election.endTime) {
      return res.status(400).json({ success: false, message: 'Election has already ended' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Election is not currently active' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user has already voted for this election
const checkDuplicateVote = async (req, res, next) => {
  try {
    const { electionId } = req.body;
    const userId = req.user.id;

    const existingVote = await Vote.findOne({ userId, electionId });

    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { validateVotingWindow, checkDuplicateVote };
