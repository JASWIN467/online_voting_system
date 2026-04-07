const express = require('express');
const router = express.Router();
const {
  getElections,
  getElectionCandidates,
  castVote,
} = require('../controllers/voterController');
const { protect } = require('../middleware/authMiddleware');
const { validateVotingWindow, checkDuplicateVote } = require('../middleware/voteMiddleware');
const { check } = require('express-validator');

// All voter routes are protected by JWT
router.use(protect);

router.get('/elections', getElections);
router.get('/elections/:id/candidates', getElectionCandidates);

// Voting requires time validation and duplicate check
router.post(
  '/vote',
  [
    check('electionId', 'electionId is required').isMongoId(),
    check('candidateId', 'candidateId is required').isMongoId(),
  ],
  validateVotingWindow,
  checkDuplicateVote,
  castVote
);

module.exports = router;
