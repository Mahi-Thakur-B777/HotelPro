
const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/adminUserController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Only authenticated admins can view registered users
router.get("/", protect, adminOnly, getAllUsers);

module.exports = router;
