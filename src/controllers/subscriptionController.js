const mongoose = require("mongoose");
const SubscriptionPlan = require("../models/SubscriptionPlans");
const VendorProfile = require("../models/VendorProfile");
const UserSubscription = require("../models/UserSubscription");

exports.getVendorPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findOne({ vendor: req.user._id });
        res.json({ plans });
    } catch (error) {
        console.error("Get vendor plans error:", error);
        res.status(500).json({ message: "Failed to fetch plans" });
    }
};

exports.updateVendorPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findOneAndUpdate(
            { vendor: req.user._id },
            {
                vendor: req.user._id,
                ...req.body,
            },
            { upsert: true, new: true }
        );
        res.json({ message: "Plans updated", plans });
    } catch (error) {
        console.error("Update vendor plans error:", error);
        res.status(500).json({ message: "Failed to update plans" });
    }
};

exports.getVendorPlansById = async (req, res) => {
    try {
        const { vendorId } = req.params;

        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).json({ message: "Invalid vendor ID" });
        }

        const vendorProfile = await VendorProfile.findById(vendorId);
        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const plans = await SubscriptionPlan.findOne({
            vendor: vendorProfile.user,
        });

        res.json({
            plans,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch plans",
        });
    }
};

exports.createSubscription = async (req, res) => {
    try {
        console.log("createSubscription body:", req.body);
        console.log("createSubscription user:", req.user?._id);
        const { vendorId, planType, price, duration } = req.body;

        // vendorId from frontend is VendorProfile._id — validate it exists
        const vendorProfile = await VendorProfile.findById(vendorId);
        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const subscription = await UserSubscription.create({
            user: req.user._id,
            vendor: vendorProfile._id,
            planType,
            price,
            duration,
            startDate,
            endDate,
        });

        res.json({
            message: "Subscription created",
            subscription,
        });
    } catch (error) {
        console.error("Create subscription error:", error);
        res.status(500).json({ message: "Failed to create subscription" });
    }
};

exports.getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await UserSubscription.find({
            user: req.user._id,
        }).populate("vendor", "businessName foodType address");

        res.json({ subscriptions });
    } catch (error) {
        console.error("Get my subscriptions error:", error);
        res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
};

exports.getVendorSubscriptions = async (req, res) => {
    try {
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor profile not found" });
        }

        const subs = await UserSubscription.find({
            vendor: vendorProfile._id,
        })
            .populate("user", "name phone address")
            .sort({ createdAt: -1 });

        res.json({ subscriptions: subs });
    } catch (error) {
        console.error("Get vendor subscriptions error:", error);
        res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
};

exports.acceptSubscription = async (req, res) => {
    const { id } = req.params;

    const sub = await UserSubscription.findByIdAndUpdate(
        id,
        { status: "accepted" },
        { new: true }
    );

    res.json({
        message: "Subscription accepted",
        subscription: sub,
    });
};

exports.rejectSubscription = async (req, res) => {
    const { id } = req.params;

    const sub = await UserSubscription.findByIdAndUpdate(
        id,
        { status: "rejected" },
        { new: true }
    );

    res.json({
        message: "Subscription rejected",
        subscription: sub,
    });
};