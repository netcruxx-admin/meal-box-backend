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
      required: true,
    },

    price: Number,

    duration: Number, // days

    startDate: Date,

    endDate: Date,

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);