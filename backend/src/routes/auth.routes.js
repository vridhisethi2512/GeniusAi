const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', protect, authController.logout);

router.get('/me', protect, authController.getMe);
router.patch('/me', protect, updateProfileValidator, validate, authController.updateMe);
router.patch(
  '/change-password',
  protect,
  changePasswordValidator,
  validate,
  authController.changePassword
);

module.exports = router;
