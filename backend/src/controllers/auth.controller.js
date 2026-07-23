/**
 * Auth controller.
 * Thin HTTP layer over auth.service.js — handles req/res, cookies, and
 * delegates all business logic to the service layer.
 */

const asyncHandler = require('express-async-handler');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/generateTokens');

// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, targetRole, experienceLevel } = req.body;

  const { user, accessToken, refreshToken } = await authService.registerUser({
    name,
    email,
    password,
    targetRole,
    experienceLevel,
  });

  setRefreshTokenCookie(res, refreshToken);

  return new ApiResponse(201, { user, accessToken }, 'Account created successfully').send(res);
});

// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });

  setRefreshTokenCookie(res, refreshToken);

  return new ApiResponse(200, { user, accessToken }, 'Logged in successfully').send(res);
});

// @route   POST /api/v1/auth/refresh
// @access  Public (requires valid refresh token cookie)
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const { accessToken, user } = await authService.refreshAccessToken(refreshToken);

  return new ApiResponse(200, { user, accessToken }, 'Access token refreshed').send(res);
});

// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  clearRefreshTokenCookie(res);

  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return new ApiResponse(200, { user }, 'Current user fetched successfully').send(res);
});

// @route   PATCH /api/v1/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);

  return new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
});

// @route   PATCH /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  return new ApiResponse(200, null, 'Password changed successfully').send(res);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  changePassword,
};
