const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { voteLimiter } = require('../middleware/rateLimitMiddleware');
const { castVote, getMyVotes } = require('../controllers/voteController');

const router = express.Router();

router.get('/me', protect, getMyVotes);

router.post(
  '/',
  protect,
  voteLimiter,
  [
    check('electionId', 'valid electionId is required').isMongoId(),
    check('candidateId', 'valid candidateId is required').isMongoId(),
  ],
  castVote
);

module.exports = router;

