const express = require('express');
const router = express.Router();

const {
  createReview,
  getVendorReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// Public
router.get('/vendor/:vendorId', getVendorReviews);

// User only
router.post('/', protect, authorize('user'), createReview);
router.put('/:id', protect, authorize('user'), updateReview);
router.delete('/:id', protect, authorize('user'), deleteReview);

module.exports = router;
