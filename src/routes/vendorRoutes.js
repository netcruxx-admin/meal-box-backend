const express = require('express');
const router = express.Router();

const { getVendorMe, updateVendorMe, getAllVendors, getVendorById } = require('../controllers/vendorController');
const { getWeeklyMenu, saveWeeklyMenu } = require('../controllers/vendorMenuController');
const { getVendorPlans, updateVendorPlans } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public / User app
router.get('/', getAllVendors);

// Vendor self routes
router.get('/me', protect, authorize('vendor'), getVendorMe);
router.put('/me', protect, authorize('vendor'), updateVendorMe);

// Menu routes (must be before /:id to avoid "menu" being treated as an ID)
router.get('/menu', protect, authorize('vendor'), getWeeklyMenu);
router.put('/menu', protect, authorize('vendor'), saveWeeklyMenu);

// Plans routes (must be before /:id)
router.get('/plans', protect, authorize('vendor'), getVendorPlans);
router.put('/plans', protect, authorize('vendor'), updateVendorPlans);

router.get('/:id', getVendorById);

module.exports = router;
