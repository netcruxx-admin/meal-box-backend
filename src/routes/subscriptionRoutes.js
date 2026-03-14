const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    getVendorPlans,
    updateVendorPlans,
} = require("../controllers/subscriptionController");

router.get("/plans", protect, authorize("vendor"), getVendorPlans);
router.put("/plans", protect, authorize("vendor"), updateVendorPlans);

module.exports = router;