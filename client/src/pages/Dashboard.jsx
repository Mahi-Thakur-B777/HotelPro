
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1>My Dashboard</h1>
        <p className="text-muted">
          Welcome back, {user?.name || "Guest"}!
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Browse Rooms</h5>
              <p className="card-text">
                Explore available rooms and find your perfect stay.
              </p>
              <Link to="/rooms" className="btn btn-primary">
                Explore Rooms
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">My Bookings</h5>
              <p className="card-text">
                View your reservations and booking history.
              </p>
              <Link to="/my-bookings" className="btn btn-primary">
                View Bookings
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">My Profile</h5>
              <p className="card-text">
                View your account information.
              </p>
              <Link to="/profile" className="btn btn-primary">
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

