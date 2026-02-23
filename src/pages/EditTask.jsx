import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "./Workspace.css";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        const current = response.data.task;
        setTask(current);
        setTitle(current.title || "");
        setDescription(current.description || "");
        setStatus(current.status || "todo");
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load task.");
      }
    };

    loadTask();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/tasks/${id}`, {
        title: title.trim(),
        description: description.trim(),
        status,
      });
      toast.success("Task updated successfully.");
      const projectId = task?.project?._id;
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Edit Task</h1>
            <p className="workspace-sub">{task ? `Project: ${task.project?.name || "-"}` : "Loading task..."}</p>
          </div>
          <div className="workspace-nav">
            {task?.project?._id ? (
              <Link className="btn secondary" to={`/projects/${task.project._id}`}>Back to Project</Link>
            ) : (
              <Link className="btn secondary" to="/dashboard">Dashboard</Link>
            )}
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

            <select
              className="workspace-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <div className="workspace-actions">
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Task"}
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

export default EditTask;
