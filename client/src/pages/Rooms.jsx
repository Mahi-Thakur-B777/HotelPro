
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get("/rooms");
        setRooms(response.data.rooms || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load rooms. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-outline-primary">
          Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Explore Our Rooms</h1>
          <p className="text-muted">
            Find a comfortable room for your next stay.
          </p>
        </div>

        <Link to="/dashboard" className="btn btn-outline-primary">
          My Dashboard
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="alert alert-info">
          No rooms are currently available. Please check back later.
        </div>
      ) : (
        <div className="row g-4">
          {rooms.map((room) => (
            <div className="col-md-6 col-lg-4" key={room._id}>
              <div className="card h-100 shadow-sm">
                {room.images?.length > 0 && (
                  <img
                    src={room.images[0]}
                    className="card-img-top"
                    alt={`${room.roomType} room`}
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    {room.roomType} Room
                  </h5>

                  <p className="text-muted mb-2">
                    Room number: {room.roomNumber}
                  </p>

                  <p>{room.description || "A comfortable hotel room."}</p>

                  <p>
                    <strong>Capacity:</strong> {room.capacity} guests
                  </p>

                  <p className="fw-bold fs-5">
                    ₹{Number(room.pricePerNight).toLocaleString("en-IN")}
                    <span className="text-muted fs-6"> / night</span>
                  </p>

                  {room.amenities?.length > 0 && (
                    <p className="small text-muted">
                      Amenities: {room.amenities.join(", ")}
                    </p>
                  )}

                  <Link
                    to={`/rooms/${room._id}`}
                    className="btn btn-primary mt-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Rooms;
