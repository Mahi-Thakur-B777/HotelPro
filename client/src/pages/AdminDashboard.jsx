
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();

  const sections = [
    {
      title: "Manage Rooms",
      description: "Add new rooms and manage existing room information.",
      link: "/admin/rooms",
      button: "Manage Rooms",
    },
    {
      title: "Manage Bookings",
      description: "Review customer reservations and their status.",
      link: "/admin/bookings",
      button: "Manage Bookings",
    },
    {
      title: "Manage Users",
      description: "View registered customer accounts.",
      link: "/admin/users",
      button: "Manage Users",
    },
  ];

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1>Admin Dashboard</h1>
        <p className="text-muted">
          Welcome, {user?.name || "Administrator"}.
        </p>
      </div>

      <div className="row g-4">
        {sections.map((section) => (
          <div className="col-md-4" key={section.title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{section.title}</h5>
                <p className="card-text">{section.description}</p>
                <Link
                  to={section.link}
                  className="btn btn-primary mt-auto"
                >
                  {section.button}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/" className="btn btn-outline-secondary mt-4">
        Back to Home
      </Link>
    </div>
  );
}

export default AdminDashboard;

