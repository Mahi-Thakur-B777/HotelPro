
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  async function fetchBookings() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("hotelproToken");
      const response = await api.get("/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your bookings. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleCancel(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("hotelproToken");
      const response = await api.patch(
        `/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message || "Booking cancelled successfully.");
      await fetchBookings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to cancel this booking."
      );
    } finally {
      setCancellingId("");
    }
  }

  if (loading) {
    return <div className="container py-5">Loading your bookings...</div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>My Bookings</h1>
          <p className="text-muted">
            View and manage your hotel reservations.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-primary">
          My Dashboard
        </Link>
      </div>

      {message && (
        <div className="alert alert-success" role="alert">{message}</div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h4>No bookings yet</h4>
            <p className="text-muted">
              Find a room and make your first reservation.
            </p>
            <Link to="/rooms" className="btn btn-primary">
              Browse Rooms
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => (
            <div className="col-12" key={booking._id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between gap-3">
                    <div>
                      <h5>{booking.room?.roomType || "Hotel Room"}</h5>
                      <p className="text-muted mb-1">
                        Reference: {booking.bookingReference}
                      </p>
                      <p className="mb-1">
                        Room number: {booking.room?.roomNumber || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`badge ${
                        booking.status === "confirmed"
                          ? "text-bg-success"
                          : booking.status === "cancelled"
                          ? "text-bg-danger"
                          : "text-bg-secondary"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <hr />

                  <div className="row g-3">
                    <div className="col-sm-6 col-lg-3">
                      <strong>Check-in</strong>
                      <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <strong>Check-out</strong>
                      <div>{new Date(booking.checkOut).toLocaleDateString()}</div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <strong>Guests</strong>
                      <div>{booking.guests}</div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <strong>Total</strong>
                      <div className="fw-bold">
                        ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <strong>Payment status:</strong> {booking.paymentStatus}
                  </div>

                  {booking.status === "confirmed" && (
                    <button
                      className="btn btn-outline-danger mt-3"
                      disabled={cancellingId === booking._id}
                      onClick={() => handleCancel(booking._id)}
                    >
                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
