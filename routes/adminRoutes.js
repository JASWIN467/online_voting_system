const express = require('express');
const router = express.Router();
const {
  listElections,
  createElection,
  addCandidate,
  getElectionResults,
  getElectionAnalytics,
  startElection,
  endElection,
  getAuditLogs,
  exportElectionCsv,
  exportElectionPdf,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { check, param } = require('express-validator');

// All routes here are protected and restricted to admin
router.use(protect);
router.use(adminOnly);

router.get('/elections', listElections);
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/export.csv', exportAuditLogsCsv);
router.get('/audit-logs/export.pdf', exportAuditLogsPdf);

router.post(
  '/elections',
  [
    check('title', 'title is required').trim().notEmpty(),
    check('description', 'description is required').trim().notEmpty(),
    check('startTime', 'startTime must be a valid ISO date').isISO8601(),
    check('endTime', 'endTime must be a valid ISO date').isISO8601(),
  ],
  createElection
);

router.post(
  '/candidates',
  [
    check('name', 'name is required').trim().notEmpty(),
    check('party', 'party is required').trim().notEmpty(),
    check('electionId', 'electionId is required').isMongoId(),
  ],
  addCandidate
);

router.patch('/elections/:id/start', [param('id').isMongoId()], startElection);
router.patch('/elections/:id/end', [param('id').isMongoId()], endElection);
router.get('/elections/:id/results', getElectionResults);
router.get('/elections/:id/analytics', [param('id').isMongoId()], getElectionAnalytics);
router.get('/elections/:id/export.csv', [param('id').isMongoId()], exportElectionCsv);
router.get('/elections/:id/export.pdf', [param('id').isMongoId()], exportElectionPdf);

module.exports = router;
