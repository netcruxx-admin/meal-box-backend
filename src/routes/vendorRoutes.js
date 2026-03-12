const express = require('express');
const router = express.Router();

const { getVendorMe, updateVendorMe, getAllVendors, getVendorById } = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public / User app
router.get('/', getAllVendors);

// Vendor self routes
router.get('/me', protect, authorize('vendor'), getVendorMe);
router.put('/me', protect, authorize('vendor'), updateVendorMe);
router.get('/:id', getVendorById);

module.exports = router;
