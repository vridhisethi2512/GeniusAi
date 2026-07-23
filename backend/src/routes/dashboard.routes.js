const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', dashboardController.getOverview);

module.exports = router;
