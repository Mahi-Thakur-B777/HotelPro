
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();
let dbConnection;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
  })
);

app.use(express.json());

// Root health check
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to HotelPro API",
    status: "Backend is running",
  });
});

// Connect to MongoDB before handling API requests.
app.use(async (req, res, next) => {
  try {
    if (!dbConnection) {
      dbConnection = connectDB();
    }
    await dbConnection;
    next();
  } catch (error) {
    dbConnection = null;
    console.error("Database connection error:", error.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/users", adminUserRoutes);

module.exports = app;
