const express = require('express');
const { param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { getElectionResults } = require('../controllers/resultsController');

const router = express.Router();

router.get('/:electionId', protect, [param('electionId').isMongoId()], getElectionResults);

module.exports = router;

