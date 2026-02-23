import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Workspace.css";

function Profile() {
  const navigate = useNavigate();
  const { role, logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/test/protected");
        setProfile(response.data.user || null);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Profile</h1>
            <p className="workspace-sub">Your account details and session info.</p>
          </div>
          <div className="workspace-nav">
            <Link className="btn secondary" to="/dashboard">Dashboard</Link>
            <button className="btn danger" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <section className="workspace-panel">
          {loading ? (
            <div className="workspace-empty">Loading profile...</div>
          ) : (
            <div className="workspace-grid">
              <article className="workspace-card">
                <h3>Role</h3>
                <p>{profile?.role || role || "user"}</p>
              </article>
              <article className="workspace-card">
                <h3>User ID</h3>
                <p>{profile?._id || user?.id || "-"}</p>
              </article>
              <article className="workspace-card">
                <h3>Name</h3>
                <p>{profile?.name || "-"}</p>
              </article>
              <article className="workspace-card">
                <h3>Email</h3>
                <p>{profile?.email || "-"}</p>
              </article>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Profile;
