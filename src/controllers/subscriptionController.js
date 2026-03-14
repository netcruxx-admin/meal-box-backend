const SubscriptionPlan = require("../models/SubscriptionPlans");

exports.getVendorPlans = async (req, res) => {
    const plans = await SubscriptionPlan.findOne({ vendor: req.user._id });

    res.json({
        plans,
    });
};

exports.updateVendorPlans = async (req, res) => {
    const plans = await SubscriptionPlan.findOneAndUpdate(
        { vendor: req.user._id },
        {
            vendor: req.user._id,
            ...req.body,
        },
        { upsert: true, new: true }
    );

    res.json({
        message: "Plans updated",
        plans,
    });
};