const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    createSubscription,
    getMySubscriptions,
} = require("../controllers/subscriptionController");

router.post("/subscribe", protect, authorize("user"), createSubscription);
router.get("/my-subscriptions", protect, getMySubscriptions);

module.exports = router;
