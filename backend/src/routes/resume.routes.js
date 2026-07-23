const express = require('express');
const router = express.Router();

const resumeController = require('../controllers/resume.controller');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { handleResumeUpload } = require('../middleware/uploadMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  analyzeResumeValidator,
  resumeIdParamValidator,
} = require('../validators/resume.validator');

router.use(protect);

router.post(
  '/analyze',
  aiLimiter,
  handleResumeUpload,
  analyzeResumeValidator,
  validate,
  resumeController.analyzeResume
);

router.get('/', resumeController.getMyResumes);
router.get('/:id', resumeIdParamValidator, validate, resumeController.getResumeById);
router.delete('/:id', resumeIdParamValidator, validate, resumeController.deleteResume);

module.exports = router;
