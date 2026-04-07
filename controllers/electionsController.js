const { validationResult } = require('express-validator');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { logAdminAction } = require('../middleware/auditMiddleware');

const computeIsActive = (startTime, endTime) => {
  const now = new Date();
  return now >= new Date(startTime) && now <= new Date(endTime);
};

const createElection = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, startTime, endTime } = req.body;
    const isActive = computeIsActive(startTime, endTime);
    const election = await Election.create({ title, description, startTime, endTime, isActive });

    await logAdminAction({
      adminId: req.user?._id,
      action: 'CREATE_ELECTION',
      resourceType: 'Election',
      resourceId: election._id,
      metadata: { title: election.title },
    });

    return res.status(201).json({ success: true, data: election });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    const data = elections.map((election) => ({
      ...election.toObject(),
      isActive: computeIsActive(election.startTime, election.endTime),
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveElections = async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ startTime: 1 });

    const data = elections.map((election) => ({
      ...election.toObject(),
      isActive: true,
    }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateElection = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const hasVotes = await Vote.exists({ electionId: req.params.id });
    if (hasVotes) {
      return res.status(400).json({
        success: false,
        message: 'Election is locked because voting has already started',
      });
    }

    const { title, description, startTime, endTime } = req.body;
    const isActive = computeIsActive(startTime, endTime);

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, startTime, endTime, isActive },
      { new: true, runValidators: true }
    );

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    await logAdminAction({
      adminId: req.user?._id,
      action: 'UPDATE_ELECTION',
      resourceType: 'Election',
      resourceId: election._id,
      metadata: { title: election.title },
    });

    return res.status(200).json({ success: true, data: election });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteElection = async (req, res) => {
  try {
    const hasVotes = await Vote.exists({ electionId: req.params.id });
    if (hasVotes) {
      return res.status(400).json({
        success: false,
        message: 'Election is locked because voting has already started',
      });
    }

    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    await logAdminAction({
      adminId: req.user?._id,
      action: 'DELETE_ELECTION',
      resourceType: 'Election',
      resourceId: election._id,
      metadata: { title: election.title },
    });

    return res.status(200).json({ success: true, message: 'Election deleted successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createElection,
  getAllElections,
  getActiveElections,
  updateElection,
  deleteElection,
};

