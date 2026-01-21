const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        businessName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            pincode: String,
        },

        serviceAreas: [String],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
