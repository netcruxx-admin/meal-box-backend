const mongoose = require('mongoose');

const mealSchema = {
    items: [String], // ["Aloo Paratha", "Curd"]
    deliveryTime: {
        start: String, // "08:00 AM"
        end: String,   // "09:00 AM"
    },
    description: String,
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
