const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateProfileValidator } = require('../validators/auth.validator');

router.use(protect);

router.get('/profile', userController.getProfile);
router.patch('/profile', updateProfileValidator, validate, userController.updateProfile);
router.delete('/profile', userController.deactivateAccount);

module.exports = router;
