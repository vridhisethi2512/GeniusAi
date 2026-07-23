/**
 * Validation chains for authentication & profile routes.
 * Used with express-validator + validateMiddleware.
 */

const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('targetRole')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Target role must not exceed 100 characters'),
  body('experienceLevel')
    .optional({ checkFalsy: true })
    .isIn(['student', 'fresher', 'junior', 'mid', 'senior'])
    .withMessage('Invalid experience level'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const updateProfileValidator = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('targetRole')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Target role must not exceed 100 characters'),
  body('experienceLevel')
    .optional({ checkFalsy: true })
    .isIn(['student', 'fresher', 'junior', 'mid', 'senior'])
    .withMessage('Invalid experience level'),
  body('profilePicture')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Profile picture must be a valid URL'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/\d/).withMessage('New password must contain at least one number'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
};
