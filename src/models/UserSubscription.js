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
      enum: [
        "pending",    // user subscribed, waiting vendor approval
        "accepted",   // vendor approved
        "rejected",   // vendor rejected
        "active",     // (future: when service starts)
        "completed",
        "cancelled"
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);