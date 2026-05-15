const Review = require('../models/Review');
const VendorProfile = require('../models/VendorProfile');

/**
 * @desc    Create a review for a vendor
 * @route   POST /api/reviews
 * @access  Private (user only)
 */
exports.createReview = async (req, res) => {
  try {
    const { vendorId, rating, comment } = req.body;

    if (!vendorId || !rating) {
      return res.status(400).json({ message: 'vendorId and rating are required' });
    }

    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
    }

    const vendor = await VendorProfile.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const existing = await Review.findOne({ user: req.user._id, vendor: vendorId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this vendor' });
    }

    const review = await Review.create({
      user: req.user._id,
      vendor: vendorId,
      rating: Number(rating),
      comment,
    });

    await review.populate('user', 'name');

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all reviews for a vendor
 * @route   GET /api/reviews/vendor/:vendorId
 * @access  Public
 */
exports.getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vendor = await VendorProfile.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const [reviews, totalReviews, ratingAgg] = await Promise.all([
      Review.find({ vendor: vendorId })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ vendor: vendorId }),
      Review.aggregate([
        { $match: { vendor: vendor._id } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]),
    ]);

    const averageRating =
      ratingAgg.length > 0 ? Math.round(ratingAgg[0].averageRating * 10) / 10 : 0;

    res.status(200).json({
      totalReviews,
      averageRating,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      reviews,
    });
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update own review
 * @route   PUT /api/reviews/:id
 * @access  Private (user only)
 */
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    if (rating !== undefined) {
      if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
      }
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();
    await review.populate('user', 'name');

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete own review
 * @route   DELETE /api/reviews/:id
 * @access  Private (user only)
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
