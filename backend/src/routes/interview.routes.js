const express = require('express');
const router = express.Router();

const interviewController = require('../controllers/interview.controller');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  createSessionValidator,
  sessionIdParamValidator,
  submitAnswerValidator,
  historyQueryValidator,
} = require('../validators/interview.validator');

router.use(protect);

router.post('/', aiLimiter, createSessionValidator, validate, interviewController.createSession);
router.get('/', historyQueryValidator, validate, interviewController.getHistory);

router.get('/:sessionId', sessionIdParamValidator, validate, interviewController.getSession);
router.post(
  '/:sessionId/answers',
  aiLimiter,
  submitAnswerValidator,
  validate,
  interviewController.submitAnswer
);
router.patch(
  '/:sessionId/complete',
  sessionIdParamValidator,
  validate,
  interviewController.completeSession
);
router.patch(
  '/:sessionId/abandon',
  sessionIdParamValidator,
  validate,
  interviewController.abandonSession
);

module.exports = router;
