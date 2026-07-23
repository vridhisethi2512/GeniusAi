const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const {
  generateAuthTokens,
  verifyRefreshToken,
  generateAccessToken,
} = require('../utils/generateTokens');
const logger = require('../utils/logger');

const registerUser = async ({ name, email, password, targetRole, experienceLevel }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    targetRole,
    experienceLevel,
  });

  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  logger.info(`New user registered: ${user.email}`);

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.isDeactivated) {
    throw ApiError.forbidden('This account has been deactivated. Please contact support.');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  logger.info(`User logged in: ${user.email}`);

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token not provided.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  const user = await User.findById(decoded.id);

  if (!user || user.isDeactivated) {
    throw ApiError.unauthorized('User no longer exists or is deactivated.');
  }

  const accessToken = generateAccessToken(user._id);

  return { accessToken, user: user.toSafeObject() };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  return user.toSafeObject();
};

const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['name', 'targetRole', 'experienceLevel', 'profilePicture'];
  const sanitizedUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  return user.toSafeObject();
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,
  changePassword,
};
