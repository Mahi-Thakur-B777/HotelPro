
const Room = require("../models/room");

// Get all active rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get rooms failed:", error.message);
    return res.status(500).json({
      message: "Failed to retrieve rooms.",
    });
  }
};

// Get one active room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    return res.status(200).json({ room });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid room ID.",
      });
    }

    console.error("Get room failed:", error.message);
    return res.status(500).json({
      message: "Failed to retrieve room.",
    });
  }
};

// Create a room — protect this route with protect and adminOnly
exports.createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      description,
      pricePerNight,
      capacity,
      amenities,
      images,
    } = req.body;

    if (
      !roomNumber ||
      !roomType ||
      !description ||
      pricePerNight === undefined ||
      capacity === undefined
    ) {
      return res.status(400).json({
        message:
          "Room number, room type, description, price, and capacity are required.",
      });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      description,
      pricePerNight,
      capacity,
      amenities: amenities || [],
      images: images || [],
    });

    return res.status(201).json({
      message: "Room created successfully.",
      room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A room with this room number already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create room failed:", error.message);
    return res.status(500).json({
      message: "Failed to create room.",
    });
  }
};

// Update a room — admin-only route
exports.updateRoom = async (req, res) => {
  try {
    const allowedFields = [
      "roomNumber",
      "roomType",
      "description",
      "pricePerNight",
      "capacity",
      "amenities",
      "images",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update.",
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      message: "Room updated successfully.",
      room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A room with this room number already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid room details or room ID.",
      });
    }

    console.error("Update room failed:", error.message);
    return res.status(500).json({
      message: "Failed to update room.",
    });
  }
};

// Deactivate a room rather than deleting its record
exports.deactivateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      message: "Room deactivated successfully.",
      room,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid room ID.",
      });
    }

    console.error("Deactivate room failed:", error.message);
    return res.status(500).json({
      message: "Failed to deactivate room.",
    });
  }
};
