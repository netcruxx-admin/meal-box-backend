const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Tiffin App API is running 🚀');
});

module.exports = app;