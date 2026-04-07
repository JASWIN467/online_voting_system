const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');

const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const results = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: '$candidateId', voteCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: '_id',
          as: 'candidate',
        },
      },
      { $unwind: '$candidate' },
      {
        $project: {
          _id: 0,
          candidateId: '$candidate._id',
          name: '$candidate.name',
          party: '$candidate.party',
          voteCount: 1,
        },
      },
      { $sort: { voteCount: -1, name: 1 } },
    ]);

    const [totalVotesAgg, totalVoters] = await Promise.all([
      Vote.aggregate([
        { $match: { electionId: election._id } },
        { $group: { _id: '$electionId', totalVotes: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'user' }),
    ]);

    const totalVotes = totalVotesAgg[0]?.totalVotes || 0;
    const turnoutPct = totalVoters > 0 ? Number(((totalVotes / totalVoters) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        electionId: election._id,
        title: election.title,
        turnout: {
          totalVoters,
          totalVotes,
          turnoutPct,
        },
        results,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getElectionResults };

