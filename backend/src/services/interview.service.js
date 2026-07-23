const InterviewSession = require('../models/InterviewSession.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const ApiError = require('../utils/ApiError');
const { generateInterviewQuestions } = require('./ai/interviewGen.service');
const { evaluateAnswer } = require('./ai/answerEvaluation.service');
const logger = require('../utils/logger');

const createInterviewSession = async ({ userId, role, interviewType, difficulty, totalQuestions }) => {
  const generatedQuestions = await generateInterviewQuestions({
    role,
    interviewType,
    difficulty,
    totalQuestions,
  });

  const session = await InterviewSession.create({
    user: userId,
    role,
    interviewType,
    difficulty,
    totalQuestions: generatedQuestions.length,
    status: 'in-progress',
    startedAt: new Date(),
  });

  const questionDocs = await Question.insertMany(
    generatedQuestions.map((q) => ({
      ...q,
      session: session._id,
      user: userId,
    }))
  );

  session.questions = questionDocs.map((q) => q._id);
  await session.save();

  logger.info(`Interview session created (sessionId: ${session._id}) for user ${userId}`);

  return {
    session: sanitizeSession(session),
    questions: questionDocs.map(sanitizeQuestion),
  };
};

const getSessionWithQuestions = async (userId, sessionId) => {
  const session = await InterviewSession.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw ApiError.notFound('Interview session not found.');
  }

  const questions = await Question.find({ session: sessionId }).sort({ order: 1 });
  const answers = await Answer.find({ session: sessionId });

  const answersByQuestion = new Map(answers.map((a) => [a.question.toString(), a]));

  const questionsWithAnswers = questions.map((q) => ({
    ...sanitizeQuestion(q),
    answer: answersByQuestion.has(q._id.toString())
      ? sanitizeAnswer(answersByQuestion.get(q._id.toString()))
      : null,
  }));

  return {
    session: sanitizeSession(session),
    questions: questionsWithAnswers,
  };
};

const submitAnswer = async ({ userId, sessionId, questionId, answerText, responseTimeInSeconds }) => {
  const session = await InterviewSession.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw ApiError.notFound('Interview session not found.');
  }

  if (session.status !== 'in-progress') {
    throw ApiError.badRequest('This interview session is no longer active.');
  }

  const question = await Question.findOne({ _id: questionId, session: sessionId });

  if (!question) {
    throw ApiError.notFound('Question not found in this session.');
  }

  const existingAnswer = await Answer.findOne({ question: questionId });

  if (existingAnswer) {
    throw ApiError.conflict('This question has already been answered.');
  }

  const evaluation = await evaluateAnswer({
    questionText: question.questionText,
    category: question.category,
    idealAnswerPoints: question.idealAnswerPoints,
    answerText,
    role: session.role,
  });

  const answer = await Answer.create({
    session: sessionId,
    question: questionId,
    user: userId,
    answerText,
    responseTimeInSeconds,
    evaluation,
    evaluationStatus: 'completed',
  });

  session.answers.push(answer._id);
  await session.save();

  return sanitizeAnswer(answer);
};

const completeInterviewSession = async ({ userId, sessionId }) => {
  const session = await InterviewSession.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw ApiError.notFound('Interview session not found.');
  }

  if (session.status === 'completed') {
    return sanitizeSession(session);
  }

  const answers = await Answer.find({ session: sessionId, evaluationStatus: 'completed' });

  const overallFeedback = computeOverallFeedback(answers);

  session.status = 'completed';
  session.completedAt = new Date();
  session.durationInSeconds = Math.max(
    0,
    Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)
  );
  session.overallFeedback = overallFeedback;

  await session.save();

  logger.info(`Interview session completed (sessionId: ${session._id})`);

  return sanitizeSession(session);
};

const abandonInterviewSession = async ({ userId, sessionId }) => {
  const session = await InterviewSession.findOneAndUpdate(
    { _id: sessionId, user: userId, status: 'in-progress' },
    { status: 'abandoned', completedAt: new Date() },
    { new: true }
  );

  if (!session) {
    throw ApiError.notFound('Active interview session not found.');
  }

  return sanitizeSession(session);
};

const getUserInterviewHistory = async (userId, { page = 1, limit = 10, status } = {}) => {
  const query = { user: userId };
  if (status) query.status = status;

  const skip = (Math.max(1, page) - 1) * limit;

  const [sessions, total] = await Promise.all([
    InterviewSession.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    InterviewSession.countDocuments(query),
  ]);

  return {
    sessions: sessions.map(sanitizeSession),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const computeOverallFeedback = (answers) => {
  if (!answers.length) {
    return {
      averageScore: 0,
      strengths: [],
      areasForImprovement: [],
      summary: 'No answers were evaluated for this session.',
    };
  }

  const averageScore = Math.round(
    (answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answers.length) * 10
  );

  const allMissedPoints = answers.flatMap((a) => a.evaluation?.missedPoints || []);
  const areasForImprovement = [...new Set(allMissedPoints)].slice(0, 6);

  const strongAnswers = answers.filter((a) => (a.evaluation?.score || 0) >= 7);
  const strengths = strongAnswers.length
    ? [`Answered ${strongAnswers.length} out of ${answers.length} questions strongly.`]
    : [];

  const summary =
    averageScore >= 75
      ? 'Strong overall performance with well-structured, relevant answers.'
      : averageScore >= 50
      ? 'Solid performance with room for improvement in a few key areas.'
      : 'Performance indicates significant room for improvement — review the feedback on each answer closely.';

  return { averageScore, strengths, areasForImprovement, summary };
};

const sanitizeSession = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
};

const sanitizeQuestion = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
};

const sanitizeAnswer = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
};

module.exports = {
  createInterviewSession,
  getSessionWithQuestions,
  submitAnswer,
  completeInterviewSession,
  abandonInterviewSession,
  getUserInterviewHistory,
};
