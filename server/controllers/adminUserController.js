
const User = require("../models/user");

// Admin-only: retrieve registered users without password hashes
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users failed:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve users.",
    });
  }
};
