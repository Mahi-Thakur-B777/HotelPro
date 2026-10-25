
const express = require("express");
const router = express.Router();

const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deactivateRoom,
} = require("../controllers/roomController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public routes: view active rooms
router.get("/", getRooms);
router.get("/:id", getRoomById);

// Admin-only routes
router.post("/", protect, adminOnly, createRoom);
router.put("/:id", protect, adminOnly, updateRoom);
router.patch("/:id/deactivate", protect, adminOnly, deactivateRoom);

module.exports = router;
