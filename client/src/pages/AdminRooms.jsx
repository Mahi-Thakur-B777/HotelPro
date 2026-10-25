
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  roomNumber: "",
  roomType: "Deluxe",
  pricePerNight: "",
  capacity: "2",
  description: "",
  amenities: "",
};

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("danger");

  function showMessage(text, type = "danger") {
    setMessage(text);
    setMessageType(type);
  }

  async function fetchRooms() {
    try {
      const response = await api.get("/rooms");
      const data = response.data;

      setRooms(
        Array.isArray(data)
          ? data
          : Array.isArray(data.rooms)
            ? data.rooms
            : []
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to load rooms."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingRoomId(null);
  }

  function handleEdit(room) {
    setEditingRoomId(room._id);

    setFormData({
      roomNumber: String(room.roomNumber ?? ""),
      roomType: room.roomType || "Deluxe",
      pricePerNight: String(room.pricePerNight ?? ""),
      capacity: String(room.capacity ?? 2),
      description: room.description || "",
      amenities: Array.isArray(room.amenities)
        ? room.amenities.join(", ")
        : "",
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const price = Number(formData.pricePerNight);
    const capacity = Number(formData.capacity);

    if (
      !formData.roomNumber.trim() ||
      !formData.description.trim() ||
      formData.pricePerNight === "" ||
      formData.capacity === ""
    ) {
      showMessage("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      showMessage("Enter a valid price and guest capacity.");
      return;
    }

    const token = localStorage.getItem("hotelproToken");

    if (!token) {
      showMessage("Please log in again before managing rooms.");
      return;
    }

    const roomData = {
      roomNumber: formData.roomNumber.trim(),
      roomType: formData.roomType,
      pricePerNight: price,
      capacity,
      description: formData.description.trim(),
      amenities: formData.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setSaving(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingRoomId) {
        await api.put(
          `/rooms/${editingRoomId}`,
          roomData,
          config
        );

        showMessage("Room updated successfully!", "success");
      } else {
        await api.post("/rooms", roomData, config);

        showMessage("Room added successfully!", "success");
      }

      resetForm();
      await fetchRooms();
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to save room. Check your admin login and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(room) {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate Room ${room.roomNumber}? It will be removed from public room listings.`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("hotelproToken");

    if (!token) {
      showMessage("Please log in again before managing rooms.");
      return;
    }

    try {
      await api.patch(
        `/rooms/${room._id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage(
        `Room ${room.roomNumber} has been deactivated.`,
        "success"
      );

      await fetchRooms();
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to deactivate room."
      );
    }
  }

  return (
    <div className="container py-4">
      <h1 className="text-center mb-3">Manage Rooms</h1>

      <div className="text-center mb-4">
        <Link to="/admin" className="btn btn-secondary">
          Back to Admin Dashboard
        </Link>
      </div>

      {message && (
        <div
          className={`alert alert-${messageType}`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="card mb-5">
        <div className="card-header">
          <h2 className="h5 mb-0">
            {editingRoomId ? "Edit Room" : "Add a New Room"}
          </h2>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Room Number *</label>
              <input
                className="form-control"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g. 103"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Room Type *</label>
              <select
                className="form-select"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Price per Night (₹) *
                </label>
                <input
                  className="form-control"
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Maximum Guests *
                </label>
                <input
                  className="form-control"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Amenities (comma-separated)
              </label>
              <input
                className="form-control"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="WiFi, Air Conditioning, TV"
              />
            </div>

            <button
              className="btn btn-primary me-2"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingRoomId
                  ? "Save Changes"
                  : "Add Room"}
            </button>

            {editingRoomId && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      </div>

      <h2 className="mb-3">Existing Active Rooms</h2>

      {loading ? (
        <p>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <p>No active rooms found.</p>
      ) : (
        <div className="row g-3">
          {rooms.map((room) => (
            <div className="col-md-6 col-lg-4" key={room._id}>
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="h5">Room {room.roomNumber}</h3>

                  <p>Type: {room.roomType}</p>
                  <p>Price: ₹{room.pricePerNight} per night</p>
                  <p>Capacity: {room.capacity} guests</p>
                  <p>
                    Status: {room.isActive ? "Active" : "Inactive"}
                  </p>

                  {room.description && <p>{room.description}</p>}

                  {room.amenities?.length > 0 && (
                    <p>
                      Amenities: {room.amenities.join(", ")}
                    </p>
                  )}

                  <div className="d-flex gap-2 flex-wrap mt-3">
                    <button
                      className="btn btn-warning"
                      type="button"
                      onClick={() => handleEdit(room)}
                    >
                      Edit Room
                    </button>

                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleDeactivate(room)}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRooms;
