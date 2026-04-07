const express = require('express');
const { check, param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  addCandidate,
  getCandidatesByElection,
  deleteCandidate,
} = require('../controllers/candidatesController');

const router = express.Router();

router.post(
  '/',
  protect,
  adminOnly,
  [
    check('name', 'name is required').trim().notEmpty(),
    check('party', 'party is required').trim().notEmpty(),
    check('electionId', 'valid electionId is required').isMongoId(),
  ],
  addCandidate
);

router.get(
  '/:electionId',
  protect,
  [param('electionId', 'valid electionId is required').isMongoId()],
  getCandidatesByElection
);

router.delete('/:id', protect, adminOnly, [param('id').isMongoId()], deleteCandidate);

module.exports = router;

