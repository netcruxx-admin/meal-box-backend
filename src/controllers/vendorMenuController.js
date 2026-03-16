const mongoose = require('mongoose');
const WeeklyMenu = require('../models/WeeklyMenu');
const VendorProfile = require('../models/VendorProfile');

// GET menu
exports.getWeeklyMenu = async (req, res) => {
    const menu = await WeeklyMenu.findOne({ vendor: req.user._id });
    res.json({ menu });
};

// SAVE / UPDATE menu
exports.saveWeeklyMenu = async (req, res) => {
    const menu = await WeeklyMenu.findOneAndUpdate(
        { vendor: req.user._id },
        {
            vendor: req.user._id,
            ...req.body,
        },
        { upsert: true, new: true }
    );

    res.json({
        message: 'Menu saved successfully',
        menu,
    });
};

exports.getVendorMenuById = async (req, res) => {
    try {
        const { vendorId } = req.params;

        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).json({ message: 'Invalid vendor ID' });
        }

        const vendorProfile = await VendorProfile.findById(vendorId);
        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const menu = await WeeklyMenu.findOne({ vendor: vendorProfile.user });

        res.json({
            menu,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch vendor menu",
        });
    }
};