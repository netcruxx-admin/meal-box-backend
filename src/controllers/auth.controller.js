const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { fullName, phone, password, role } = req.body;

        console.log(fullName, phone, password, role, 'kkkk');
        

        // Validation
        if (!fullName || !phone || !password) {
            return res.status(400).json({
                message: 'All fields are required',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this phone number',
            });
        }

        const allowedRoles = ['user', 'vendor'];
        const userRole = allowedRoles.includes(role) ? role : 'user';

        // Create user
        const user = await User.create({
            name: fullName,
            phone,
            password,
            role: userRole,
        });


        res.status(201).json({
            message: 'User registered successfully',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validation
        if (!phone || !password) {
            return res.status(400).json({
                message: 'Phone and password are required',
            });
        }

        // Find user & include password
        const user = await User.findOne({ phone }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid phone or password',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid phone or password',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                message: 'Your account is disabled',
            });
        }

        res.status(200).json({
            message: 'Login successful',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
