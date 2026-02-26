import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { bumpSyncVersion } from "../store/syncSlice";
import "./Workspace.css";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, user } = useAuth();
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [labelsInput, setLabelsInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  const currentUserId = user?.id || user?._id || null;
  const ownerId = task?.project?.owner?._id || task?.project?.owner || null;
  const canManageTask = role === "admin" && ownerId && currentUserId && String(ownerId) === String(currentUserId);

  const assignableMembers = useMemo(() => {
    const project = task?.project;
    if (!project) return [];

    const list = [];
    if (project.owner) list.push(project.owner);
    if (Array.isArray(project.members)) list.push(...project.members);

    const map = new Map();
    list.forEach((member) => {
      const memberId = member?._id || member;
      if (!memberId) return;
      if (!map.has(String(memberId))) {
        map.set(String(memberId), member);
      }
    });

    return Array.from(map.values());
  }, [task]);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        const current = response.data.task;
        setTask(current);
        setTitle(current.title || "");
        setDescription(current.description || "");
        setStatus(current.status || "todo");
        setPriority(current.priority || "medium");
        setLabelsInput(Array.isArray(current.labels) ? current.labels.join(", ") : "");
        setDueDate(current.dueDate ? new Date(current.dueDate).toISOString().split("T")[0] : "");
        setAssignedTo(current.assignedTo?._id || current.assignedTo || "");
        setAttachments(Array.isArray(current.attachments) ? current.attachments : []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load task.");
      }
    };

    loadTask();
  }, [id]);

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManageTask) {
      toast.error("Only project admin can update task.");
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
      await api.put(`/tasks/${id}`, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        labels,
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
        attachments,
      });
      dispatch(bumpSyncVersion());
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
          {!canManageTask ? (
            <div className="workspace-empty">Only project admin can update task.</div>
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

              <select className="workspace-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select className="workspace-select" value={priority} onChange={(event) => setPriority(event.target.value)}>
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

              {attachments.length > 0 && (
                <div className="workspace-muted">
                  {attachments.map((att, idx) => (
                    <div key={`${att.url}-${idx}`} className="workspace-actions" style={{ justifyContent: "space-between" }}>
                      <span>{att.name}</span>
                      <button className="btn danger" type="button" onClick={() => removeAttachment(idx)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="workspace-actions">
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Updating..." : "Update Task"}
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

export default EditTask;



