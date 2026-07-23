import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { evaluationService } from '../services/evaluation.service.js';

/**
 * @desc    Get detailed AI scorecard evaluation of an interview session
 * @route   GET /api/v1/evaluations/interviews/:sessionId
 * @access  Private
 */
const getInterviewEvaluation = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { sessionId } = req.params;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const evaluation = await evaluationService.getInterviewFeedback(sessionId, userId);
    if (!evaluation) {
        throw new ApiError(404, "Evaluation not found or interview not yet fully completed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { evaluation }, "Interview evaluation scorecard retrieved successfully"));
});

/**
 * @desc    Get job compatibility matches and resume alignment evaluations
 * @route   GET /api/v1/evaluations/resumes/:resumeId
 * @access  Private
 */
const getResumeEvaluation = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { resumeId } = req.params;
    const { jobDescriptionId } = req.query; // optional, filter by specific target comparison

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const evaluation = await evaluationService.getResumeFeedback(resumeId, jobDescriptionId, userId);
    if (!evaluation) {
        throw new ApiError(404, "Resume evaluation data not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { evaluation }, "Resume match compatibility evaluation retrieved successfully"));
});

/**
 * @desc    Get aggregated progression summary scores and learning trends
 * @route   GET /api/v1/evaluations/trends
 * @access  Private
 */
const getOverallPerformanceSummary = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const summary = await evaluationService.getPerformanceSummary(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { summary }, "Performance and progression insights retrieved successfully"));
});

/**
 * @desc    Force generate evaluation feedback with custom parameters/rubrics
 * @route   POST /api/v1/evaluations/regenerate
 * @access  Private
 */
const generateMockFeedback = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { sessionId, customRubrics } = req.body;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!sessionId) {
        throw new ApiError(400, "Session ID is required to generate customized feedback");
    }

    const customizedEvaluation = await evaluationService.generateCustomFeedback({
        userId,
        sessionId,
        customRubrics: customRubrics || {}
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { evaluation: customizedEvaluation }, "Custom evaluation scorecard generated successfully"));
});

export {
    getInterviewEvaluation,
    getResumeEvaluation,
    getOverallPerformanceSummary,
    generateMockFeedback
};
