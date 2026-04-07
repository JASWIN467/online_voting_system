const express = require('express');
const { check, param } = require('express-validator');
const {
  createElection,
  getAllElections,
  getActiveElections,
  updateElection,
  deleteElection,
} = require('../controllers/electionsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getAllElections);
router.get('/active', protect, getActiveElections);

router.post(
  '/',
  protect,
  adminOnly,
  [
    check('title', 'title is required').trim().notEmpty(),
    check('description', 'description is required').trim().notEmpty(),
    check('startTime', 'startTime must be a valid ISO date').isISO8601(),
    check('endTime', 'endTime must be a valid ISO date').isISO8601(),
  ],
  createElection
);

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    param('id', 'valid election id is required').isMongoId(),
    check('title', 'title is required').trim().notEmpty(),
    check('description', 'description is required').trim().notEmpty(),
    check('startTime', 'startTime must be a valid ISO date').isISO8601(),
    check('endTime', 'endTime must be a valid ISO date').isISO8601(),
  ],
  updateElection
);

router.delete('/:id', protect, adminOnly, [param('id').isMongoId()], deleteElection);

module.exports = router;

