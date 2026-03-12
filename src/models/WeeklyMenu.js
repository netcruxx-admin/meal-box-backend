const mongoose = require('mongoose');

const mealSchema = {
  mealName: {
    type: String,
    trim: true,
  },

  items: {
    type: [String],
    default: [],
  },

  deliveryTime: {
    start: String,
    end: String,
  },

  description: {
    type: String,
    trim: true,
  },
};

const daySchema = {
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
};

const weeklyMenuSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
    sunday: daySchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklyMenu', weeklyMenuSchema);