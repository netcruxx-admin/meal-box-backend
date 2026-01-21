const User = require("../models/User");

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Update logged-in user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
    try {
        const { name, phone, password, address } = req.body;

        // Find user
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (password) user.password = password; // will auto-hash

        if (address) {
            user.address = {
                ...user.address,
                ...address,
            };
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                address: user.address,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
