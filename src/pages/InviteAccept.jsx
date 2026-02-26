import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { bumpSyncVersion } from "../store/syncSlice";
import "./Workspace.css";

function InviteAccept() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token: authToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const handleAccept = async () => {
    if (!token) {
      toast.error("Invitation token missing.");
      return;
    }

    if (!authToken) {
      navigate(`/?redirect=${encodeURIComponent(`/invite/accept?token=${token}`)}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/collaboration/invitations/accept", { token });
      dispatch(bumpSyncVersion());
      toast.success(response.data.message || "Invitation accepted.");
      if (response.data.projectId) {
        navigate(`/projects/${response.data.projectId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not accept invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Project Invitation</h1>
            <p className="workspace-sub">Accept this invitation to join your teammate's project.</p>
          </div>
          <div className="workspace-nav">
            <Link className="btn secondary" to="/dashboard">Dashboard</Link>
          </div>
        </header>

        <section className="workspace-panel">
          <div className="workspace-card">
            <p className="workspace-muted">Token: {token ? "Found" : "Missing"}</p>
            {!authToken && (
              <p className="workspace-muted">
                Please login with the invited email account to accept this invitation.
              </p>
            )}
            <div className="workspace-actions">
              <button className="btn" onClick={handleAccept} disabled={!token || submitting}>
                {authToken ? (submitting ? "Accepting..." : "Accept Invitation") : "Login to Accept"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default InviteAccept;
