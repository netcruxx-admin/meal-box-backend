const express = require('express');
const { getWeeklyMenu, updateWeeklyMenu } = require('../controllers/vendorMenuController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/menu', protect, authorize('vendor'), getWeeklyMenu);
router.put('/menu', protect, authorize('vendor'), updateWeeklyMenu);

module.exports = router;
