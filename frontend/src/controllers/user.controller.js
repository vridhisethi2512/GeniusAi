import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { userService } from '../services/user.service.js';

/**
 * @desc    Get complete user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const profile = await userService.getProfile(userId);
    if (!profile) {
        throw new ApiError(404, "User profile not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { profile }, "User profile fetched successfully"));
});

/**
 * @desc    Update user profile details
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    // Expecting fields: name, targetJob, experienceLevel, skills, bio, socialLinks
    const profileData = req.body;

    const updatedProfile = await userService.updateProfile(userId, profileData);

    return res
        .status(200)
        .json(new ApiResponse(200, { profile: updatedProfile }, "Profile updated successfully"));
});

/**
 * @desc    Update user profile avatar picture
 * @route   PATCH /api/v1/users/avatar
 * @access  Private
 */
const updateAvatar = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath && !req.body.avatarUrl) {
        throw new ApiError(400, "Avatar file or avatar URL is required");
    }

    const updatedProfile = await userService.updateAvatar(userId, {
        localPath: avatarLocalPath,
        url: req.body.avatarUrl
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { profile: updatedProfile }, "Avatar updated successfully"));
});

/**
 * @desc    Get user interview preparation stats & analytics
 * @route   GET /api/v1/users/stats
 * @access  Private
 */
const getInterviewStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const stats = await userService.getStats(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { stats }, "User interview stats retrieved successfully"));
});

/**
 * @desc    Completely delete user account & clean up assets
 * @route   DELETE /api/v1/users/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    await userService.deleteAccount(userId);

    const clearCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    return res
        .status(200)
        .clearCookie("accessToken", clearCookieOptions)
        .clearCookie("refreshToken", clearCookieOptions)
        .json(new ApiResponse(200, {}, "User account and all associated data permanently deleted"));
});

export {
    getProfile,
    updateProfile,
    updateAvatar,
    getInterviewStats,
    deleteAccount
};
