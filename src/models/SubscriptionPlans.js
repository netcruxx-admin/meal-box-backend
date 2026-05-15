const mongoose = require("mongoose");

const durationPlanSchema = new mongoose.Schema(
  {
    duration: Number,
    discount: { type: Number, default: 0 },
    mealPlans: { type: Map, of: Number },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    weekly: durationPlanSchema,
    monthly: durationPlanSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", planSchema);
