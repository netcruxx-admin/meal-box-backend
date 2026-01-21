const VendorProfile = require('../models/VendorProfile');

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
        businessName,
        description,
        address,
        serviceAreas,
      } = req.body;
  
      if (!businessName) {
        return res.status(400).json({
          message: 'Business name is required',
        });
      }
  
      const vendor = await VendorProfile.findOneAndUpdate(
        { user: req.user._id },
        {
          user: req.user._id,
          businessName,
          description,
          address,
          serviceAreas,
        },
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
  