/**
 * Interview controller.
 * Handles the mock interview lifecycle: session creation, fetching
 * session state, submitting answers, and completing/abandoning sessions.
 */

const asyncHandler = require('express-async-handler');
const interviewService = require('../services/interview.service');
const ApiResponse = require('../utils/ApiResponse');

// @route   POST /api/v1/interviews
// @access  Private
const createSession = asyncHandler(async (req, res) => {
  const { role, interviewType, difficulty, totalQuestions } = req.body;

  const result = await interviewService.createInterviewSession({
    userId: req.user._id,
    role,
    interviewType: interviewType || 'mixed',
    difficulty: difficulty || 'intermediate',
    totalQuestions: totalQuestions || 5,
  });

  return new ApiResponse(201, result, 'Interview session created successfully').send(res);
});

// @route   GET /api/v1/interviews/:sessionId
// @access  Private
const getSession = asyncHandler(async (req, res) => {
  const result = await interviewService.getSessionWithQuestions(req.user._id, req.params.sessionId);

  return new ApiResponse(200, result, 'Interview session fetched successfully').send(res);
});

// @route   POST /api/v1/interviews/:sessionId/answers
// @access  Private
const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, answerText, responseTimeInSeconds } = req.body;

  const answer = await interviewService.submitAnswer({
    userId: req.user._id,
    sessionId: req.params.sessionId,
    questionId,
    answerText,
    responseTimeInSeconds,
  });

  return new ApiResponse(201, { answer }, 'Answer submitted and evaluated successfully').send(res);
});

// @route   PATCH /api/v1/interviews/:sessionId/complete
// @access  Private
const completeSession = asyncHandler(async (req, res) => {
  const session = await interviewService.completeInterviewSession({
    userId: req.user._id,
    sessionId: req.params.sessionId,
  });

  return new ApiResponse(200, { session }, 'Interview session completed successfully').send(res);
});

// @route   PATCH /api/v1/interviews/:sessionId/abandon
// @access  Private
const abandonSession = asyncHandler(async (req, res) => {
  const session = await interviewService.abandonInterviewSession({
    userId: req.user._id,
    sessionId: req.params.sessionId,
  });

  return new ApiResponse(200, { session }, 'Interview session abandoned').send(res);
});

// @route   GET /api/v1/interviews
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const result = await interviewService.getUserInterviewHistory(req.user._id, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status,
  });

  return new ApiResponse(200, result, 'Interview history fetched successfully').send(res);
});

module.exports = {
  createSession,
  getSession,
  submitAnswer,
  completeSession,
  abandonSession,
  getHistory,
};
