
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("hotelproToken");

        const response = await api.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          name: response.data.user.name,
          email: response.data.user.email,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("hotelproToken");

      const response = await api.put("/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = response.data.user;

      login(updatedUser, token);

      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="container py-5">Loading profile...</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: "650px" }}>
      <h1>My Profile</h1>
      <p className="text-muted">
        View and update your HotelPro account information.
      </p>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full name
              </label>
              <input
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <p className="text-muted small">
              Signed in as: {user?.role || "customer"}
            </p>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      <Link to="/dashboard" className="btn btn-outline-secondary mt-3">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default Profile;
 