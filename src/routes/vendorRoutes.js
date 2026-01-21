const express = require('express');
const router = express.Router();

const { getVendorMe, updateVendorMe } = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/me', protect, authorize('vendor'), getVendorMe);
router.put('/me', protect, authorize('vendor'), updateVendorMe);

module.exports = router;
