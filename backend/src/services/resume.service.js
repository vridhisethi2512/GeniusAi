const path = require('path');
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const parseResumeFile = require('../utils/parseResumeFile');
const { analyzeResume } = require('./ai/resumeAnalysis.service');
const logger = require('../utils/logger');

const FILE_TYPE_MAP = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const processResumeUpload = async ({ userId, filePath, mimeType, originalFileName, targetRole }) => {
  const fileType = FILE_TYPE_MAP[mimeType];

  if (!fileType) {
    throw ApiError.badRequest('Unsupported resume file type.');
  }

  const extractedText = await parseResumeFile(filePath, mimeType);

  const effectiveTargetRole = targetRole || (await getUserTargetRole(userId));

  let analysis;
  try {
    analysis = await analyzeResume(extractedText, effectiveTargetRole);
  } catch (error) {
    logger.error(`Resume analysis failed for user ${userId}: ${error.message}`);
    throw error;
  }

  const resume = await Resume.create({
    user: userId,
    originalFileName: path.basename(originalFileName),
    fileType,
    extractedText,
    analysis,
    status: 'completed',
  });

  logger.info(`Resume analyzed and saved for user ${userId} (resumeId: ${resume._id})`);

  return sanitizeResume(resume);
};

const getUserTargetRole = async (userId) => {
  const user = await User.findById(userId).select('targetRole');
  return user?.targetRole || '';
};

const getUserResumes = async (userId) => {
  const resumes = await Resume.find({ user: userId }).sort({ createdAt: -1 });
  return resumes.map(sanitizeResume);
};

const getResumeById = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }

  return sanitizeResume(resume);
};

const deleteResume = async (userId, resumeId) => {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, user: userId });

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }
};

const getLatestResumeSummary = async (userId) => {
  const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });

  if (!resume) return null;

  return {
    resumeId: resume._id,
    overallScore: resume.analysis.overallScore,
    atsScore: resume.analysis.atsScore,
    createdAt: resume.createdAt,
  };
};

const sanitizeResume = (resumeDoc) => {
  const obj = resumeDoc.toObject ? resumeDoc.toObject() : resumeDoc;
  delete obj.extractedText;
  delete obj.__v;
  return obj;
};

module.exports = {
  processResumeUpload,
  getUserResumes,
  getResumeById,
  deleteResume,
  getLatestResumeSummary,
};
