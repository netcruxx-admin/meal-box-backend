const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    createSubscription,
    getMySubscriptions,
    getVendorSubscriptions,
    acceptSubscription,
    rejectSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    getVendorOverview,
} = require("../controllers/subscriptionController");

router.post("/subscribe", protect, authorize("user"), createSubscription);
router.get("/my-subscriptions", protect, getMySubscriptions);

router.get("/vendor/overview", protect, authorize("vendor"), getVendorOverview);
router.get("/vendor", protect, authorize("vendor"), getVendorSubscriptions);
router.patch("/:id/accept", protect, authorize("vendor"), acceptSubscription);
router.patch("/:id/reject", protect, authorize("vendor"), rejectSubscription);
router.patch("/:id/pause", protect, authorize("user"), pauseSubscription);
router.patch("/:id/resume", protect, authorize("user"), resumeSubscription);
router.patch("/:id/cancel", protect, authorize("user"), cancelSubscription);

module.exports = router;
