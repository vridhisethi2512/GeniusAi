const InterviewSession = require('../models/InterviewSession.model');
const Resume = require('../models/Resume.model');
const { getLatestResumeSummary } = require('./resume.service');

const getDashboardOverview = async (userId) => {
  const [
    latestResume,
    resumeCount,
    interviewStats,
    recentSessions,
    scoreTrend,
  ] = await Promise.all([
    getLatestResumeSummary(userId),
    Resume.countDocuments({ user: userId }),
    getInterviewAggregateStats(userId),
    getRecentSessions(userId, 5),
    getScoreTrend(userId, 10),
  ]);

  return {
    resume: {
      totalUploaded: resumeCount,
      latest: latestResume,
    },
    interview: interviewStats,
    recentActivity: recentSessions,
    progressTrend: scoreTrend,
  };
};

const getInterviewAggregateStats = async (userId) => {
  const [totalSessions, completedSessions, aggregateResult] = await Promise.all([
    InterviewSession.countDocuments({ user: userId }),
    InterviewSession.countDocuments({ user: userId, status: 'completed' }),
    InterviewSession.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          'overallFeedback.averageScore': { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$overallFeedback.averageScore' },
          bestScore: { $max: '$overallFeedback.averageScore' },
        },
      },
    ]),
  ]);

  const stats = aggregateResult[0] || { averageScore: 0, bestScore: 0 };

  return {
    totalSessions,
    completedSessions,
    inProgressSessions: totalSessions - completedSessions,
    averageScore: Math.round(stats.averageScore || 0),
    bestScore: Math.round(stats.bestScore || 0),
  };
};

const getRecentSessions = async (userId, limit = 5) => {
  const sessions = await InterviewSession.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('role interviewType difficulty status overallFeedback.averageScore createdAt completedAt');

  return sessions.map((s) => ({
    sessionId: s._id,
    role: s.role,
    interviewType: s.interviewType,
    difficulty: s.difficulty,
    status: s.status,
    averageScore: s.overallFeedback?.averageScore ?? null,
    createdAt: s.createdAt,
    completedAt: s.completedAt,
  }));
};

const getScoreTrend = async (userId, limit = 10) => {
  const sessions = await InterviewSession.find({
    user: userId,
    status: 'completed',
    'overallFeedback.averageScore': { $exists: true },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('role overallFeedback.averageScore createdAt');

  return sessions
    .map((s) => ({
      sessionId: s._id,
      role: s.role,
      score: s.overallFeedback.averageScore,
      date: s.createdAt,
    }))
    .reverse();
};

module.exports = {
  getDashboardOverview,
};
