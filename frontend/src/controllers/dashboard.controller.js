import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { dashboardService } from '../services/dashboard.service.js';

/**
 * @desc    Get dashboard landing summaries including KPIs, recent practices, and recommendation engine recommendations
 * @route   GET /api/v1/dashboard/summary
 * @access  Private
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const summary = await dashboardService.getSummary(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { summary }, "Dashboard landing summary analytics retrieved successfully"));
});

/**
 * @desc    Get paginated logs of activities (practices, analyses, resume revisions)
 * @route   GET /api/v1/dashboard/activity-logs
 * @access  Private
 */
const getActivityLogs = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const activityLogs = await dashboardService.getLogs(userId, { page, limit });

    return res
        .status(200)
        .json(new ApiResponse(200, activityLogs, "Paginated activity logs retrieved successfully"));
});

export {
    getDashboardSummary,
    getActivityLogs
};
