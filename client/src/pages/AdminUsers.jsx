
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("hotelproToken");

        const response = await api.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Manage Users</h1>

      <Link to="/admin" className="btn btn-secondary mb-4">
        Back to Admin Dashboard
      </Link>

      {loading && <p>Loading users...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <p>
            Total registered users: <strong>{users.length}</strong>
          </p>

          {users.length === 0 ? (
            <div className="alert alert-info">
              No registered users found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === "admin"
                              ? "text-bg-primary"
                              : "text-bg-secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
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

export default AdminUsers;
