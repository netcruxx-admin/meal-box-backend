const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProfile",
      required: true,
    },

    planType: {
      type: String,
      enum: ["weekly", "monthly"],
    },

    planDuration: {
      type: String,
      enum: ["weekly", "monthly"],
    },

    mealType: {
      type: String,
      enum: [
        "breakfast_only",
        "lunch_only",
        "dinner_only",
        "breakfast_lunch",
        "breakfast_dinner",
        "lunch_dinner",
        "full_day",
      ],
    },

    basePrice: Number,
    finalPrice: Number,
    discount: Number,
    price: Number,

    duration: Number, // days

    startDate: Date,

    endDate: Date,

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "active",
        "completed",
        "cancelled",
        "expired",
        "paused"
      ],
      default: "pending",
    },

    pauseHistory: [
      {
        pauseStartDate: { type: Date, required: true },
        pauseEndDate:   { type: Date, required: true },
        pausedDays:     { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);