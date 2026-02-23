import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "./Workspace.css";

function CreateTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data.project);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load project.");
      }
    };

    fetchProject();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        project: id,
      });
      toast.success("Task created successfully.");
      navigate(`/projects/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Create Task</h1>
            <p className="workspace-sub">{project ? `Project: ${project.name}` : "Preparing task form..."}</p>
          </div>
          <div className="workspace-nav">
            <Link className="btn secondary" to={`/projects/${id}`}>Back to Project</Link>
          </div>
        </header>

        <section className="workspace-panel">
          <form className="workspace-form" onSubmit={handleSubmit}>
            <input
              className="workspace-input"
              placeholder="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <textarea
              className="workspace-textarea"
              placeholder="Task description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <div className="workspace-actions">
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Task"}
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

export default CreateTask;
