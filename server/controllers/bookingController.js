
const Booking = require("../models/booking");
const Room = require("../models/room");

// Create a booking for the logged-in customer
exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    if (!roomId || !checkIn || !checkOut || guests === undefined) {
      return res.status(400).json({
        message: "Room, check-in, check-out, and guests are required.",
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const guestCount = Number(guests);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.toISOString().slice(0, 10) !== checkIn ||
      end.toISOString().slice(0, 10) !== checkOut
    ) {
      return res.status(400).json({
        message: "Please provide valid check-in and check-out dates.",
      });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (start < today || end <= start) {
      return res.status(400).json({
        message:
          "Check-in must be today or later, and check-out must be after check-in.",
      });
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        message: "Guests must be a positive whole number.",
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      isActive: true,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found or unavailable.",
      });
    }

    if (guestCount > room.capacity) {
      return res.status(400).json({
        message: `This room can accommodate at most ${room.capacity} guests.`,
      });
    }

    // Prevent overlapping confirmed reservations.
    // Check-out is exclusive, so another booking can start that day.
    const conflict = await Booking.findOne({
      room: room._id,
      status: "confirmed",
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (conflict) {
      return res.status(409).json({
        message:
          "This room is already booked for some or all of those dates.",
      });
    }

    const nights = Math.round(
      (end - start) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = nights * room.pricePerNight;

    const bookingReference =
      "HP-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 7).toUpperCase();

    const booking = await Booking.create({
      bookingReference,
      user: req.user.id,
      room: room._id,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
      totalAmount,
      status: "confirmed",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create booking failed:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid room ID.",
      });
    }

    return res.status(500).json({
      message: "Failed to create booking.",
    });
  }
};

// Get bookings belonging only to the logged-in customer
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    })
      .populate("room", "roomNumber roomType pricePerNight")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get customer bookings failed:", error);

    return res.status(500).json({
      message: "Failed to retrieve bookings.",
    });
  }
};

// Admin: Get all bookings with customer and room details.
// Route must use protect and adminOnly middleware.
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("room", "roomNumber roomType pricePerNight")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings failed:", error);

    return res.status(500).json({
      message: "Failed to retrieve all bookings.",
    });
  }
};

// Cancel a booking belonging only to the logged-in customer
exports.cancelBooking = async (req, res) => {
  try {
    // MyBookings.jsx sends booking._id, so search by MongoDB _id.
    // The user condition prevents cancelling another customer's booking.
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be cancelled.",
      });
    }

    booking.status = "cancelled";

    // This records the refund status only; it does not issue a real refund.
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking failed:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    return res.status(500).json({
      message: "Failed to cancel booking.",
    });
  }
};
