import { Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminRooms from "./pages/AdminRooms";
import AdminBookings from "./pages/AdminBookings";
import AdminUsers from "./pages/AdminUsers";

function Home() {
  const { user, logout } = useAuth();

  const hotelImages = [
    "HotelPro1.jpg",
    "HotelPro2.jpg",
    "HotelPro3.jpg",
    "HotelPro4.jpg",
    "HotelPro5.jpg",
    "HotelPro6.jpg",
  ];

  return (
    <div>
      {/* Homepage Hero Section */}
      <div className="container py-5" style={{ maxWidth: "1200px" }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <p className="text-primary fw-bold text-uppercase">
              Welcome to HotelPro
            </p>

            <h1 className="display-4 fw-bold">
              Find Your Perfect Stay
            </h1>

            <p className="lead text-secondary mt-3">
              Discover comfortable rooms, explore beautiful stays, and
              book your next trip with ease.
            </p>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link to="/rooms" className="btn btn-primary btn-lg">
                Explore Rooms
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn btn-outline-primary btn-lg"
                  >
                    Dashboard
                  </Link>

                  <button
                    className="btn btn-outline-danger btn-lg"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary btn-lg">
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="btn btn-outline-secondary btn-lg"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {user && (
              <p className="mt-3 text-secondary">
                Welcome, {user.name}!
              </p>
            )}
          </div>

          {/* Hotel Main Picture */}
          <div className="col-lg-6">
            <img
              src="/images/HotelPro.jpg"
              alt="Hotel main view"
              className="img-fluid rounded-4 shadow"
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      {/* Hotel Picture Gallery */}
      <div className="container pb-5" style={{ maxWidth: "1200px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold">Explore Our Hotel</h2>
          <p className="text-secondary">
            Take a look at our hotel and its beautiful spaces.
          </p>
        </div>

        <div className="row g-3">
          {hotelImages.map((image, index) => (
            <div className="col-6 col-md-4" key={image}>
              <img
                src={`/images/${image}`}
                alt={`Hotel view ${index + 1}`}
                className="img-fluid rounded-3 shadow-sm"
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/rooms" className="btn btn-primary btn-lg">
            Browse Available Rooms
          </Link>
        </div>
      </div>

      {/* Homepage Features */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Why Choose HotelPro?</h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold">Comfortable Rooms</h5>
                  <p className="text-secondary mb-0">
                    Explore room options to find a stay that suits you.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold">Easy Booking</h5>
                  <p className="text-secondary mb-0">
                    View room details and manage your bookings in one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold">Simple Management</h5>
                  <p className="text-secondary mb-0">
                    Manage rooms, bookings, and users through the admin dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetails />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/rooms" element={<AdminRooms />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="container py-5 text-center">
            <h2>404 — Page not found</h2>
            <Link to="/">Return home</Link>
          </div>
        }
      />
    </Routes>
  );
}

export default App;