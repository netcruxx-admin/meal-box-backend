const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    weekly: {
      planType: {
        type: String,
        enum: ["full_day", "lunch_dinner", "lunch_only"],
        default: "full_day",
      },
      duration: {
        type: Number,
        default: 7,
      },
      price: Number,
      discount: Number,
    },

    monthly: {
      planType: {
        type: String,
        enum: ["full_day", "lunch_dinner", "lunch_only"],
        default: "full_day",
      },
      duration: {
        type: Number,
        default: 30,
      },
      price: Number,
      discount: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", planSchema);