const roomRoutes = require("./routes/roomRoutes");
const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const profileRoutes = require("./routes/profileRoutes");

require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/profile", profileRoutes); 
app.use("/api/admin/users", adminUserRoutes);
app.get("/", (req, res) => {
 
  res.json({
    message: "Welcome to HotelPro API",
    status: "Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`HotelPro server running on port ${PORT}`);
  });
}

startServer();
