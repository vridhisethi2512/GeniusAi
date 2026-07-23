import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { interviewService } from '../services/interview.service.js';

/**
 * @desc    Create and initiate a new mock interview session
 * @route   POST /api/v1/interviews/sessions
 * @access  Private
 */
const createInterviewSession = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { 
        resumeId, 
        jobTitle, 
        jobDescription, 
        difficulty, 
        interviewType // e.g. 'Behavioral', 'Technical', 'Situational'
    } = req.body;

    if (!jobTitle || !difficulty || !interviewType) {
        throw new ApiError(400, "Job title, difficulty, and interview type are required to spawn an interview session");
    }

    const session = await interviewService.createSession({
        userId,
        resumeId,
        jobTitle,
        jobDescription: jobDescription || "",
        difficulty,
        interviewType
    });

    return res
        .status(201)
        .json(new ApiResponse(201, { session }, "Mock interview session initialized successfully"));
});

/**
 * @desc    Get all interview sessions of current user
 * @route   GET /api/v1/interviews/sessions
 * @access  Private
 */
const getInterviewSessions = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const sessions = await interviewService.getUserSessions(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { sessions }, "Interview sessions retrieved successfully"));
});

/**
 * @desc    Get details of a specific interview session
 * @route   GET /api/v1/interviews/sessions/:id
 * @access  Private
 */
const getSessionById = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { id: sessionId } = req.params;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const session = await interviewService.getSessionDetails(sessionId, userId);
    if (!session) {
        throw new ApiError(404, "Interview session not found or access denied");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { session }, "Interview session details retrieved successfully"));
});

/**
 * @desc    Submit user answer to a specific question in a session
 * @route   POST /api/v1/interviews/sessions/:id/answers
 * @access  Private
 */
const submitAnswer = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { id: sessionId } = req.params;
    const { questionId, answerText } = req.body;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!questionId || !answerText) {
        throw new ApiError(400, "Question ID and your response answer are required");
    }

    const result = await interviewService.submitUserAnswer({
        userId,
        sessionId,
        questionId,
        answerText
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Answer submitted and registered successfully"));
});

/**
 * @desc    Conclude and close an interview session
 * @route   POST /api/v1/interviews/sessions/:id/end
 * @access  Private
 */
const endInterviewSession = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { id: sessionId } = req.params;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const completedSession = await interviewService.endSession(sessionId, userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { session: completedSession }, "Interview session finalized successfully"));
});

export {
    createInterviewSession,
    getInterviewSessions,
    getSessionById,
    submitAnswer,
    endInterviewSession
};
