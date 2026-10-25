
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Customer routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.patch("/:id/cancel", protect, cancelBooking);

// Admin-only route: view all customer bookings
router.get("/admin/all", protect, adminOnly, getAllBookings);

module.exports = router;
