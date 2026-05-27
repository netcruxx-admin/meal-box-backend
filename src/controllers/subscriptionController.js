const mongoose = require("mongoose");
const SubscriptionPlan = require("../models/SubscriptionPlans");
const VendorProfile = require("../models/VendorProfile");
const UserSubscription = require("../models/UserSubscription");
const Review = require("../models/Review");

const VALID_MEAL_TYPES = [
    "breakfast_only",
    "lunch_only",
    "dinner_only",
    "breakfast_lunch",
    "breakfast_dinner",
    "lunch_dinner",
    "full_day",
];

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
        const validDurations = { weekly: 7, monthly: 30 };
        const updateData = { vendor: req.user._id };

        for (const durationKey of ["weekly", "monthly"]) {
            const block = req.body[durationKey];
            if (!block) continue;

            const { duration, discount, mealPlans } = block;

            if (duration !== undefined && duration !== validDurations[durationKey]) {
                return res.status(400).json({ message: `duration for ${durationKey} must be ${validDurations[durationKey]}` });
            }

            if (discount !== undefined && (typeof discount !== "number" || discount < 0 || discount > 100)) {
                return res.status(400).json({ message: `discount for ${durationKey} must be a number between 0 and 100` });
            }

            if (!mealPlans || Object.keys(mealPlans).length === 0) {
                return res.status(400).json({ message: `${durationKey} must have at least 1 meal plan` });
            }

            for (const [mealType, price] of Object.entries(mealPlans)) {
                if (!VALID_MEAL_TYPES.includes(mealType)) {
                    return res.status(400).json({ message: `Invalid meal type: ${mealType}` });
                }
                if (typeof price !== "number" || price < 100 || price > 100000) {
                    return res.status(400).json({ message: `Price for ${mealType} must be between 100 and 100000` });
                }
            }

            updateData[durationKey] = {
                duration: validDurations[durationKey],
                discount: discount ?? 0,
                mealPlans,
            };
        }

        const plans = await SubscriptionPlan.findOneAndUpdate(
            { vendor: req.user._id },
            updateData,
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
        const { vendorId, planDuration, mealType } = req.body;

        if (!vendorId || !planDuration || !mealType) {
            return res.status(400).json({ message: "vendorId, planDuration, and mealType are required" });
        }

        if (!["weekly", "monthly"].includes(planDuration)) {
            return res.status(400).json({ message: "planDuration must be 'weekly' or 'monthly'" });
        }

        if (!VALID_MEAL_TYPES.includes(mealType)) {
            return res.status(400).json({ message: `Invalid mealType. Valid values: ${VALID_MEAL_TYPES.join(", ")}` });
        }

        const vendorProfile = await VendorProfile.findById(vendorId);
        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const planDoc = await SubscriptionPlan.findOne({ vendor: vendorProfile.user });
        if (!planDoc || !planDoc[planDuration]) {
            return res.status(404).json({ message: "Vendor does not have plans configured" });
        }

        const durationBlock = planDoc[planDuration];
        const basePrice = durationBlock.mealPlans?.get(mealType);

        if (basePrice === undefined || basePrice === null) {
            return res.status(400).json({ message: "Vendor does not offer this combination" });
        }

        const discount = durationBlock.discount ?? 0;
        const finalPrice = Math.round(basePrice * (1 - discount / 100));
        const duration = durationBlock.duration;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const subscription = await UserSubscription.create({
            user: req.user._id,
            vendor: vendorProfile._id,
            planDuration,
            mealType,
            basePrice,
            finalPrice,
            discount,
            duration,
            startDate,
            endDate,
        });

        res.json({ message: "Subscription created", subscription });
    } catch (error) {
        console.error("Create subscription error:", error);
        res.status(500).json({ message: "Failed to create subscription" });
    }
};

exports.getMySubscriptions = async (req, res) => {
    try {
        console.log("getMySubscriptions user:", req.user?._id);

        await UserSubscription.updateMany(
            {
                user: req.user._id,
                endDate: { $lt: new Date() },
                status: { $in: ["pending", "accepted", "active"] }, // paused is intentionally excluded
            },
            { status: "expired" }
        );

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

        await UserSubscription.updateMany(
            {
                vendor: vendorProfile._id,
                endDate: { $lt: new Date() },
                status: { $in: ["pending", "accepted", "active"] }, // paused is intentionally excluded
            },
            { status: "expired" }
        );

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

exports.getVendorOverview = async (req, res) => {
    try {
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor profile not found" });
        }

        const [activeSubscribers, pendingRequests, ratingData] = await Promise.all([
            UserSubscription.countDocuments({
                vendor: vendorProfile._id,
                status: { $in: ["accepted", "active"] },
            }),

            UserSubscription.countDocuments({
                vendor: vendorProfile._id,
                status: "pending",
            }),

            Review.aggregate([
                { $match: { vendor: vendorProfile._id } },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const avgRating = ratingData.length > 0 ? parseFloat(ratingData[0].avgRating.toFixed(1)) : 0;
        const totalReviews = ratingData.length > 0 ? ratingData[0].totalReviews : 0;

        res.json({
            overview: {
                activeSubscribers,
                pendingRequests,
                avgRating,
                totalReviews,
            },
        });
    } catch (error) {
        console.error("Get vendor overview error:", error);
        res.status(500).json({ message: "Failed to fetch overview" });
    }
};

exports.pauseSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { pauseStartDate, pauseEndDate } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subscription ID" });
        }

        if (!pauseStartDate || !pauseEndDate) {
            return res.status(400).json({ message: "pauseStartDate and pauseEndDate are required" });
        }

        const start = new Date(pauseStartDate);
        const end = new Date(pauseEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (start < today) {
            return res.status(400).json({ message: "pauseStartDate cannot be in the past" });
        }

        if (end <= start) {
            return res.status(400).json({ message: "pauseEndDate must be after pauseStartDate" });
        }

        const sub = await UserSubscription.findOne({ _id: id, user: req.user._id });

        if (!sub) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (!["accepted", "active"].includes(sub.status)) {
            return res.status(400).json({ message: `Cannot pause a subscription with status '${sub.status}'` });
        }

        if (start >= sub.endDate) {
            return res.status(400).json({ message: "Pause start date must be within the subscription period" });
        }

        // inclusive pause days: e.g. 10 May to 15 May = 6 days
        const pausedDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // extend end date by paused days
        const newEndDate = new Date(sub.endDate);
        newEndDate.setDate(newEndDate.getDate() + pausedDays);

        sub.endDate = newEndDate;
        sub.status = "paused";
        sub.pauseHistory.push({ pauseStartDate: start, pauseEndDate: end, pausedDays });
        await sub.save();

        res.json({
            message: `Subscription paused for ${pausedDays} day(s). New end date: ${newEndDate.toDateString()}`,
            subscription: sub,
        });
    } catch (error) {
        console.error("Pause subscription error:", error);
        res.status(500).json({ message: "Failed to pause subscription" });
    }
};

exports.resumeSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subscription ID" });
        }

        const sub = await UserSubscription.findOne({ _id: id, user: req.user._id });

        if (!sub) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (sub.status !== "paused") {
            return res.status(400).json({ message: "Subscription is not paused" });
        }

        sub.status = "accepted";
        await sub.save();

        res.json({ message: "Subscription resumed", subscription: sub });
    } catch (error) {
        console.error("Resume subscription error:", error);
        res.status(500).json({ message: "Failed to resume subscription" });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subscription ID" });
        }

        const sub = await UserSubscription.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!sub) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (["cancelled", "rejected", "completed"].includes(sub.status)) {
            return res.status(400).json({ message: `Subscription is already ${sub.status}` });
        }

        sub.status = "cancelled";
        await sub.save();

        res.json({ message: "Subscription cancelled", subscription: sub });
    } catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({ message: "Failed to cancel subscription" });
    }
};

