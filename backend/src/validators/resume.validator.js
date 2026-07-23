/**
 * Validation chains for resume routes.
 * File presence/type/size is validated by uploadMiddleware (Multer);
 * this validator covers the accompanying form fields.
 */

const { body, param } = require('express-validator');

const analyzeResumeValidator = [
  body('targetRole')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Target role must not exceed 100 characters'),
];

const resumeIdParamValidator = [
  param('id')
    .isMongoId().withMessage('Invalid resume ID'),
];

module.exports = {
  analyzeResumeValidator,
  resumeIdParamValidator,
};
