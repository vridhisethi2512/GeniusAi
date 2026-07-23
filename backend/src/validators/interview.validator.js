/**
 * Validation chains for mock interview routes.
 */

const { body, param, query } = require('express-validator');

const createSessionValidator = [
  body('role')
    .trim()
    .notEmpty().withMessage('Target role is required')
    .isLength({ max: 100 }).withMessage('Role must not exceed 100 characters'),
  body('interviewType')
    .optional({ checkFalsy: true })
    .isIn(['technical', 'hr', 'behavioral', 'mixed'])
    .withMessage('Invalid interview type'),
  body('difficulty')
    .optional({ checkFalsy: true })
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('totalQuestions')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 20 }).withMessage('Total questions must be between 1 and 20'),
];

const sessionIdParamValidator = [
  param('sessionId')
    .isMongoId().withMessage('Invalid session ID'),
];

const submitAnswerValidator = [
  param('sessionId')
    .isMongoId().withMessage('Invalid session ID'),
  body('questionId')
    .isMongoId().withMessage('Invalid question ID'),
  body('answerText')
    .trim()
    .notEmpty().withMessage('Answer text is required')
    .isLength({ max: 5000 }).withMessage('Answer text must not exceed 5000 characters'),
  body('responseTimeInSeconds')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Response time must be a non-negative integer'),
];

const historyQueryValidator = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional({ checkFalsy: true })
    .isIn(['in-progress', 'completed', 'abandoned'])
    .withMessage('Invalid status filter'),
];

module.exports = {
  createSessionValidator,
  sessionIdParamValidator,
  submitAnswerValidator,
  historyQueryValidator,
};
