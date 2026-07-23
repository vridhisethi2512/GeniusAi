/**
 * Dashboard controller.
 * Single aggregate endpoint that powers the frontend dashboard view.
 */

const asyncHandler = require('express-async-handler');
const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');

// @route   GET /api/v1/dashboard
// @access  Private
const getOverview = asyncHandler(async (req, res) => {
  const overview = await dashboardService.getDashboardOverview(req.user._id);

  return new ApiResponse(200, overview, 'Dashboard overview fetched successfully').send(res);
});

module.exports = {
  getOverview,
};
