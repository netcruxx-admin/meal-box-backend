const WeeklyMenu = require('../models/WeeklyMenu');

/**
 * GET vendor weekly menu
 */
exports.getWeeklyMenu = async (req, res) => {
    const menu = await WeeklyMenu.findOne({ vendor: req.user._id });

    res.json({
        menu: menu || null,
    });
};

/**
 * CREATE / UPDATE weekly menu
 */
exports.updateWeeklyMenu = async (req, res) => {
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
