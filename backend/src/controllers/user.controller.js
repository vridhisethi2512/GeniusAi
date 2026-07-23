/**
 * User controller.
 * Handles profile-centric operations under /api/v1/users, distinct from
 * the /api/v1/auth namespace (login/register/token lifecycle).
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return new ApiResponse(200, { user }, 'Profile fetched successfully').send(res);
});

// @route   PATCH /api/v1/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);

  return new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
});

// @route   DELETE /api/v1/users/profile
// @access  Private
// Soft-deletes the account (deactivation) rather than a hard delete,
// preserving historical resume/interview data for potential recovery.
const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isDeactivated: true },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  logger.info(`User account deactivated: ${user.email}`);

  return new ApiResponse(200, null, 'Account deactivated successfully').send(res);
});

module.exports = {
  getProfile,
  updateProfile,
  deactivateAccount,
};
