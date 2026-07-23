import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { resumeService } from '../services/resume.service.js';

/**
 * @desc    Upload and parse a new resume
 * @route   POST /api/v1/resumes/upload
 * @access  Private
 */
const uploadResume = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const resumeFile = req.file;
    if (!resumeFile) {
        throw new ApiError(400, "Resume file is required");
    }

    const title = req.body.title || resumeFile.originalname || "Untitled Resume";

    // Calls service to parse, extract text/skills, optimize, and store
    const resume = await resumeService.uploadAndParseResume({
        userId,
        file: resumeFile,
        title
    });

    return res
        .status(201)
        .json(new ApiResponse(201, { resume }, "Resume uploaded and analyzed successfully"));
});

/**
 * @desc    Get all resumes of current user
 * @route   GET /api/v1/resumes
 * @access  Private
 */
const getResumes = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const resumes = await resumeService.getUserResumes(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { resumes }, "Resumes retrieved successfully"));
});

/**
 * @desc    Get resume by ID
 * @route   GET /api/v1/resumes/:id
 * @access  Private
 */
const getResumeById = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { id: resumeId } = req.params;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const resume = await resumeService.getResumeById(resumeId, userId);
    if (!resume) {
        throw new ApiError(404, "Resume not found or access denied");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { resume }, "Resume details retrieved successfully"));
});

/**
 * @desc    Delete a resume by ID
 * @route   DELETE /api/v1/resumes/:id
 * @access  Private
 */
const deleteResume = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { id: resumeId } = req.params;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    await resumeService.deleteResume(resumeId, userId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Resume deleted successfully"));
});

/**
 * @desc    Analyze resume against a job description
 * @route   POST /api/v1/resumes/:id/analyze
 * @access  Private
 */
const analyzeResume = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { id: resumeId } = req.params;
    const { jobTitle, jobDescription } = req.body;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (!jobDescription) {
        throw new ApiError(400, "Job description is required for matching analysis");
    }

    const analysis = await resumeService.analyzeResumeAgainstJob(resumeId, {
        jobTitle: jobTitle || "Target Role",
        jobDescription
    }, userId);

    return res
        .status(200)
        .json(new ApiResponse(200, { analysis }, "Resume-to-Job matching analysis completed successfully"));
});

export {
    uploadResume,
    getResumes,
    getResumeById,
    deleteResume,
    analyzeResume
};
