import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Workspace.css";

function CreateProject() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (role !== "admin") {
      toast.error("Only admin can create project.");
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/projects", {
        name: name.trim(),
        description: description.trim(),
      });

      const projectId = response.data?.project?._id;
      toast.success("Project created successfully.");

      if (projectId) {
        navigate(`/projects/${projectId}`, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create project.");
    } finally {
      setSaving(false);
    }
  };

  if (role !== "admin") {
    return (
      <div className="workspace-shell">
        <main className="workspace-container">
          <section className="workspace-panel">
            <p className="workspace-empty">Only admin can create projects.</p>
            <div className="workspace-actions" style={{ marginTop: "0.75rem" }}>
              <Link className="btn secondary" to="/dashboard">Dashboard</Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Create Project</h1>
            <p className="workspace-sub">Start a new project workspace with clear scope.</p>
          </div>
          <div className="workspace-nav">
            <Link className="btn secondary" to="/dashboard">Dashboard</Link>
            <Link className="btn secondary" to="/profile">Profile</Link>
          </div>
        </header>

        <section className="workspace-panel">
          <form className="workspace-form" onSubmit={handleSubmit}>
            <input
              className="workspace-input"
              placeholder="Project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <textarea
              className="workspace-textarea"
              placeholder="Project description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <div className="workspace-actions">
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Project"}
              </button>
              <button className="btn secondary" type="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateProject;
