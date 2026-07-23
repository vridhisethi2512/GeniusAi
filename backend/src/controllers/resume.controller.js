/**
 * Resume controller.
 * Handles resume upload/analysis, retrieval, and deletion.
 * The actual file lives on disk temporarily (handled by uploadMiddleware)
 * and is deleted by parseResumeFile once text extraction completes.
 */

const asyncHandler = require('express-async-handler');
const resumeService = require('../services/resume.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @route   POST /api/v1/resumes/analyze
// @access  Private
const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No resume file uploaded.');
  }

  const { targetRole } = req.body;

  const resume = await resumeService.processResumeUpload({
    userId: req.user._id,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    originalFileName: req.file.originalname,
    targetRole,
  });

  return new ApiResponse(201, { resume }, 'Resume analyzed successfully').send(res);
});

// @route   GET /api/v1/resumes
// @access  Private
const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getUserResumes(req.user._id);

  return new ApiResponse(200, { resumes }, 'Resumes fetched successfully').send(res);
});

// @route   GET /api/v1/resumes/:id
// @access  Private
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.user._id, req.params.id);

  return new ApiResponse(200, { resume }, 'Resume fetched successfully').send(res);
});

// @route   DELETE /api/v1/resumes/:id
// @access  Private
const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.user._id, req.params.id);

  return new ApiResponse(200, null, 'Resume deleted successfully').send(res);
});

module.exports = {
  analyzeResume,
  getMyResumes,
  getResumeById,
  deleteResume,
};
