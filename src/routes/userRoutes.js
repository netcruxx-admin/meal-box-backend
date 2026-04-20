const express = require('express');
const router = express.Router();
const { getMe, updateMe, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.patch("/delete", protect, deleteAccount);

module.exports = router;