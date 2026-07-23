import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';

// Cookie options for security in production
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields (name, email, password) are required");
    }

    const { user, accessToken, refreshToken } = await authService.registerUser({ name, email, password });

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                201, 
                { user, accessToken, refreshToken }, 
                "User registered successfully"
            )
        );
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                { user, accessToken, refreshToken }, 
                "User logged in successfully"
            )
        );
});

/**
 * @desc    Log out a user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    await authService.logoutUser(userId);

    const clearCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    return res
        .status(200)
        .clearCookie("accessToken", clearCookieOptions)
        .clearCookie("refreshToken", clearCookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * @desc    Refresh access tokens
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    const { accessToken, refreshToken } = await authService.refreshTokens(incomingRefreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                { accessToken, refreshToken }, 
                "Access token refreshed successfully"
            )
        );
});

/**
 * @desc    Change current user's password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    await authService.changePassword(userId, oldPassword, newPassword);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Current user fetched successfully"));
});

export {
    register,
    login,
    logout,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser
};
