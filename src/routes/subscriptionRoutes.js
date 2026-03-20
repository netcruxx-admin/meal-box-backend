const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    createSubscription,
    getMySubscriptions,
    getVendorSubscriptions,
    acceptSubscription,
    rejectSubscription,
} = require("../controllers/subscriptionController");

router.post("/subscribe", protect, authorize("user"), createSubscription);
router.get("/my-subscriptions", protect, getMySubscriptions);

router.get("/vendor", protect, authorize("vendor"), getVendorSubscriptions);
router.patch("/:id/accept", protect, authorize("vendor"), acceptSubscription);
router.patch("/:id/reject", protect, authorize("vendor"), rejectSubscription);

module.exports = router;
