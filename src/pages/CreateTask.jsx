import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { bumpSyncVersion } from "../store/syncSlice";
import "./Workspace.css";

function CreateTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, user } = useAuth();
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [labelsInput, setLabelsInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [saving, setSaving] = useState(false);

  const currentUserId = user?.id || user?._id || null;
  const ownerId = project?.owner?._id || project?.owner || null;
  const canManageProject = role === "admin" && ownerId && currentUserId && String(ownerId) === String(currentUserId);

  const assignableMembers = useMemo(() => {
    if (!project) return [];
    const list = [];

    if (project.owner) {
      list.push(project.owner);
    }

    if (Array.isArray(project.members)) {
      list.push(...project.members);
    }

    const map = new Map();
    list.forEach((member) => {
      const memberId = member?._id || member;
      if (!memberId) return;
      if (!map.has(String(memberId))) {
        map.set(String(memberId), member);
      }
    });

    return Array.from(map.values());
  }, [project]);

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

    if (!canManageProject) {
      toast.error("Only project admin can create task.");
      return;
    }

    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      const labels = labelsInput
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      await api.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        project: id,
        priority,
        labels,
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
      });
      dispatch(bumpSyncVersion());
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
          {!canManageProject ? (
            <div className="workspace-empty">Only project admin can create task.</div>
          ) : (
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
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <input
                className="workspace-input"
                placeholder="Labels (comma separated, e.g. bug, design, backend)"
                value={labelsInput}
                onChange={(event) => setLabelsInput(event.target.value)}
              />

              <input
                className="workspace-input"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />

              <select
                className="workspace-select"
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              >
                <option value="">Unassigned</option>
                {assignableMembers.map((member) => {
                  const memberId = member?._id || member;
                  const memberName = member?.name || "User";
                  const memberEmail = member?.email || "";
                  return (
                    <option key={memberId} value={memberId}>
                      {memberName} {memberEmail ? `(${memberEmail})` : ""}
                    </option>
                  );
                })}
              </select>

              <div className="workspace-actions">
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Task"}
                </button>
                <button className="btn secondary" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default CreateTask;



