const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');


/**
 * @desc    Get all vendors (for user app)
 * @route   GET /api/vendors
 * @access  Public / User
 */
exports.getAllVendors = async (req, res) => {
  try {
    const { search, serviceArea, foodType } = req.query;

    let query = {};

    // Search by business name
    if (search) {
      query.businessName = { $regex: search, $options: 'i' };
    }

    // Filter by service area
    if (serviceArea) {
      query.serviceAreas = serviceArea;
    }

    // Filter by food type (veg / non-veg / both)
    if (foodType) {
      query.foodType = foodType;
    }

    const vendors = await VendorProfile.find(query)
      .populate({
        path: 'user',
        select: 'name phone isDeleted',
      })
      .sort({ createdAt: -1 });

    // 🔥 FILTER OUT deleted users
    const filteredVendors = vendors.filter(
      (v) => v.user && !v.user.isDeleted
    );

    console.log(filteredVendors, 'filteredVendors');
    res.status(200).json({
      count: filteredVendors.length,
      vendors: filteredVendors,
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get vendor details by ID (for user app)
 * @route   GET /api/vendors/:id
 * @access  Public / User
 */
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id)
      .populate('user', 'name phone');

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found',
      });
    }

    res.status(200).json({ vendor });
  } catch (error) {
    console.error('Get vendor by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get vendor profile
 * @route   GET /api/vendors/me
 * @access  Vendor
 */
exports.getVendorMe = async (req, res) => {
  try {
    const vendor = await VendorProfile.findOne({ user: req.user._id })
      .populate('user', 'name phone role');

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor profile not found',
      });
    }

    res.status(200).json({ vendor });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create or update vendor profile
 * @route   PUT /api/vendors/me
 * @access  Vendor
 */
exports.updateVendorMe = async (req, res) => {
  try {
    const {
      name,
      businessName,
      description,
      address,
      serviceAreas,
      foodType,
    } = req.body;

    if (!businessName) {
      return res.status(400).json({ message: 'Business name is required' });
    }

    // 👇 Update user's name if provided                                     
    if (name && name.trim()) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    const updateData = {
      user: req.user._id,
      businessName,
      description,
      address,
      serviceAreas,
    };

    if (foodType) {
      const validFoodTypes = ['veg', 'non-veg', 'both'];
      if (!validFoodTypes.includes(foodType)) {
        return res.status(400).json({
          message: 'foodType must be one of: veg, non-veg, both',
        });
      }
      updateData.foodType = foodType;
    }

    const vendor = await VendorProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, upsert: true }
    ).populate('user', 'name phone role');

    res.status(200).json({
      message: 'Vendor profile saved successfully',
      vendor,
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


