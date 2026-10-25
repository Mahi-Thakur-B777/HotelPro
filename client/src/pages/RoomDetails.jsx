
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchRoom() {
      try {
        const response = await api.get(`/rooms/${id}`);

        if (!cancelled) {
          setRoom(response.data.room);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load room details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRoom();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setBookingMessage("");
    setBookingSuccess(false);
  }

  const nights =
    formData.checkIn &&
    formData.checkOut &&
    formData.checkOut > formData.checkIn
      ? (
          Date.parse(`${formData.checkOut}T00:00:00Z`) -
          Date.parse(`${formData.checkIn}T00:00:00Z`)
        ) / 86400000
      : 0;

  const totalPrice =
    room && nights > 0
      ? nights * Number(room.pricePerNight)
      : 0;

  async function handleBooking(event) {
    event.preventDefault();
    setBookingMessage("");
    setBookingSuccess(false);

    const token = localStorage.getItem("hotelproToken");

    if (!token) {
      navigate("/login");
      return;
    }

    if (formData.checkIn < getToday()) {
      setBookingMessage("Check-in cannot be in the past.");
      return;
    }

    if (formData.checkOut <= formData.checkIn) {
      setBookingMessage("Check-out must be after check-in.");
      return;
    }

    const guestCount = Number(formData.guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > room.capacity
    ) {
      setBookingMessage(
        `Choose between 1 and ${room.capacity} guests.`
      );
      return;
    }

    setBookingLoading(true);

    try {
      const response = await api.post(
        "/bookings",
        {
          roomId: room._id,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: guestCount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookingSuccess(true);
      setBookingMessage(
        `Booking created successfully! Reference: ${response.data.booking.bookingReference}`
      );
      setFormData({
        checkIn: "",
        checkOut: "",
        guests: "1",
      });
    } catch (err) {
      setBookingMessage(
        err.response?.data?.message ||
          "Booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return <div className="container py-5">Loading room details...</div>;
  }

  if (error || !room) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error || "Room not found."}
        </div>
        <Link to="/rooms" className="btn btn-primary">
          Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/rooms" className="btn btn-outline-secondary mb-4">
        &larr; Back to Rooms
      </Link>

      <div className="row g-4">
        <div className="col-lg-6">
          {room.images?.length > 0 ? (
            <img
              src={room.images[0]}
              alt={`${room.roomType} room`}
              className="img-fluid rounded shadow-sm w-100"
              style={{ maxHeight: "420px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="bg-light rounded d-flex align-items-center justify-content-center"
              style={{ height: "300px" }}
            >
              <span className="text-muted">Room image unavailable</span>
            </div>
          )}

          <h1 className="mt-4">{room.roomType} Room</h1>
          <p className="text-muted">Room number: {room.roomNumber}</p>
          <p>{room.description || "A comfortable room for your stay."}</p>

          <h3 className="text-primary">
            ₹{Number(room.pricePerNight).toLocaleString("en-IN")}
            <small className="text-muted fs-6"> / night</small>
          </h3>

          <p>
            <strong>Maximum guests:</strong> {room.capacity}
          </p>

          <h5>Amenities</h5>
          {room.amenities?.length ? (
            <ul>
              {room.amenities.map((amenity, index) => (
                <li key={`${amenity}-${index}`}>{amenity}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No amenities listed.</p>
          )}
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="mb-3">Book This Room</h3>
              <p className="text-muted">
                Select your dates and number of guests.
              </p>

              {bookingMessage && (
                <div
                  className={`alert ${
                    bookingSuccess ? "alert-success" : "alert-warning"
                  }`}
                  role="alert"
                >
                  {bookingMessage}
                </div>
              )}

              <form onSubmit={handleBooking}>
                <div className="mb-3">
                  <label htmlFor="checkIn" className="form-label">
                    Check-in date
                  </label>
                  <input
                    id="checkIn"
                    type="date"
                    name="checkIn"
                    className="form-control"
                    min={getToday()}
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="checkOut" className="form-label">
                    Check-out date
                  </label>
                  <input
                    id="checkOut"
                    type="date"
                    name="checkOut"
                    className="form-control"
                    min={formData.checkIn || getToday()}
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="guests" className="form-label">
                    Number of guests
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    className="form-select"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                  >
                    {Array.from(
                      { length: room.capacity },
                      (_, index) => index + 1
                    ).map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Price per night</span>
                  <span>
                    ₹{Number(room.pricePerNight).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Number of nights</span>
                  <span>{nights > 0 ? nights : "—"}</span>
                </div>

                <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
                  <span>Estimated total</span>
                  <span>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                </button>

                <p className="small text-muted mt-3 mb-0">
                  Payment is not collected by this form. Availability is
                  confirmed by the server when you submit your booking.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetails;
