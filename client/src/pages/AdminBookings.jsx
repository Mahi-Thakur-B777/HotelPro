
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("hotelproToken");

        const response = await api.get("/bookings/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setBookings(
          Array.isArray(data.bookings) ? data.bookings : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load bookings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Manage Bookings</h1>

      <Link to="/admin" className="btn btn-secondary mb-4">
        Back to Admin Dashboard
      </Link>

      {loading && <p>Loading bookings...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <p>
            Total bookings: <strong>{bookings.length}</strong>
          </p>

          {bookings.length === 0 ? (
            <div className="alert alert-info">
              No bookings have been made yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Booking Reference</th>
                    <th>Customer</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Guests</th>
                    <th>Total Amount</th>
                    <th>Booking Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        {booking.bookingReference || "—"}
                      </td>

                      <td>
                        <div>
                          {booking.user?.name || "Unknown customer"}
                        </div>
                        <small className="text-muted">
                          {booking.user?.email || "—"}
                        </small>
                      </td>

                      <td>
                        {booking.room
                          ? `Room ${booking.room.roomNumber} (${booking.room.roomType})`
                          : "Room unavailable"}
                      </td>

                      <td>{formatDate(booking.checkIn)}</td>
                      <td>{formatDate(booking.checkOut)}</td>
                      <td>{booking.guests}</td>
                      <td>{formatAmount(booking.totalAmount)}</td>

                      <td>
                        <span className="badge text-bg-primary">
                          {booking.status || "unknown"}
                        </span>
                      </td>

                      <td>
                        <span className="badge text-bg-secondary">
                          {booking.paymentStatus || "unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminBookings;
