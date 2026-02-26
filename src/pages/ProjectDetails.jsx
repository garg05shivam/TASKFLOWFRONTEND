import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { bumpSyncVersion } from "../store/syncSlice";
import "./Workspace.css";

const PAGE_SIZE = 5;

function ProjectDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, user } = useAuth();
  const { id } = useParams();
  const syncVersion = useSelector((state) => state.sync.version);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskComments, setTaskComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [status] = useState("all");
  const [search] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [activity, setActivity] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const currentUserId = user?._id || user?.id || null;
  const ownerId = project?.owner?._id || project?.owner || null;
  const canManageProject = role === "admin" && ownerId && currentUserId && String(ownerId) === String(currentUserId);

  const fetchProject = async () => {
    const response = await api.get(`/projects/${id}`);
    setProject(response.data.project);
  };

  const fetchTasks = async (nextPage = page, nextStatus = status, nextSearch = search) => {
    let url = `/tasks?project=${id}&page=${nextPage}&limit=${PAGE_SIZE}`;
    if (nextStatus !== "all") {
      url += `&status=${nextStatus}`;
    }
    if (nextSearch.trim()) {
      url += `&search=${encodeURIComponent(nextSearch.trim())}`;
    }

    const response = await api.get(url);
    setTasks(response.data.tasks || []);
    setPage(response.data.page || 1);
    setTotalPages(response.data.totalPages || 1);
  };

  const fetchMembers = async () => {
    const response = await api.get(`/collaboration/projects/${id}/members`);
    setMembers(response.data.members || []);
    setInvitations(response.data.invitations || []);
  };

  const fetchActivity = async () => {
    const response = await api.get(`/collaboration/projects/${id}/activity`);
    setActivity(response.data.items || []);
  };

  const fetchMessages = async () => {
    const response = await api.get(`/collaboration/projects/${id}/chat`);
    setMessages((response.data.messages || []).slice().reverse());
  };

  const fetchTaskComments = async (taskId) => {
    const response = await api.get(`/collaboration/tasks/${taskId}/comments`);
    setTaskComments((prev) => ({
      ...prev,
      [taskId]: response.data.comments || [],
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchProject(),
          fetchTasks(1, "all", ""),
          fetchMembers(),
          fetchActivity(),
          fetchMessages(),
        ]);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load project details.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, syncVersion]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages().catch(() => {});
      fetchTasks(page, status, search).catch(() => {});
      fetchMembers().catch(() => {});
      fetchActivity().catch(() => {});
    }, 8000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, status, search, syncVersion]);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get("/collaboration/notifications");
        const list = response.data.notifications || [];
        setUnreadNotifications(list.filter((item) => !item.isRead).length);
      } catch {
        // Ignore unread badge errors, page should still work.
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteTask = async (taskId) => {
    if (!canManageProject) {
      toast.error("Only project admin can delete task.");
      return;
    }

    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      dispatch(bumpSyncVersion());
      toast.success("Task deleted.");
      await Promise.all([fetchTasks(page, status, search), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete task.");
    }
  };

  const handleStatusUpdate = async (taskId, nextStatus) => {
    if (!canManageProject) {
      toast.error("Only project admin can update task status.");
      return;
    }

    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      dispatch(bumpSyncVersion());
      await Promise.all([fetchTasks(page, status, search), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task status.");
    }
  };

  const handleAssignTask = async (taskId, assigneeId) => {
    if (!canManageProject) {
      toast.error("Only project admin can assign tasks.");
      return;
    }

    try {
      setAssigningTaskId(taskId);
      await api.put(`/tasks/${taskId}`, { assignedTo: assigneeId || null });
      dispatch(bumpSyncVersion());
      toast.success("Task assignee updated.");
      await Promise.all([fetchTasks(page, status, search), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not assign task.");
    } finally {
      setAssigningTaskId(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTaskId(taskId);
      const response = await api.post(`/tasks/${taskId}/complete`);
      dispatch(bumpSyncVersion());
      toast.success(response.data?.message || "Task marked done and removed.");
      await Promise.all([fetchTasks(page, status, search), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not complete task.");
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();

    if (!canManageProject) {
      toast.error("Only project admin can invite members.");
      return;
    }

    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Enter member email.");
      return;
    }

    try {
      setInviting(true);
      const response = await api.post(`/collaboration/projects/${id}/members`, { email });
      dispatch(bumpSyncVersion());
      toast.success(response.data.status === "added" ? "Member added." : "Invitation recorded.");
      setInviteEmail("");
      await Promise.all([fetchMembers(), fetchActivity()]);
    } catch (error) {
      const validationMessage = error.response?.data?.errors?.[0]?.msg;
      toast.error(error.response?.data?.message || validationMessage || "Could not add member.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!canManageProject) {
      toast.error("Only project admin can remove members.");
      return;
    }

    try {
      await api.delete(`/collaboration/projects/${id}/members/${memberId}`);
      dispatch(bumpSyncVersion());
      toast.success("Member removed.");
      await Promise.all([fetchMembers(), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove member.");
    }
  };

  const handleSendChat = async (event) => {
    event.preventDefault();
    const text = chatText.trim();
    if (!text) return;

    try {
      await api.post(`/collaboration/projects/${id}/chat`, { text });
      dispatch(bumpSyncVersion());
      setChatText("");
      await Promise.all([fetchMessages(), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send message.");
    }
  };

  const handleAddComment = async (taskId) => {
    const text = (commentInputs[taskId] || "").trim();
    if (!text) return;

    try {
      await api.post(`/collaboration/tasks/${taskId}/comments`, { text });
      dispatch(bumpSyncVersion());
      setCommentInputs((prev) => ({ ...prev, [taskId]: "" }));
      await Promise.all([fetchTaskComments(taskId), fetchActivity()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add comment.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const hasTasks = useMemo(() => tasks.length > 0, [tasks.length]);

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Project Details</h1>
            <p className="workspace-sub">{project ? project.name : "Loading project..."}</p>
          </div>
          <div className="workspace-nav">
            <Link className="btn secondary" to="/dashboard">Dashboard</Link>
            {canManageProject && <Link className="btn" to={`/projects/${id}/tasks/new`}>Create Task</Link>}
            <Link className="btn secondary" to="/notifications">
              Notifications {unreadNotifications > 0 ? `(${unreadNotifications})` : ""}
            </Link>
          </div>
        </header>

        <section className="workspace-panel">
          {loading ? (
            <div className="workspace-empty">Loading project...</div>
          ) : (
            <>

              <article className="workspace-card" style={{ marginBottom: "0.9rem" }}>
                <h3>Team Members</h3>
                {canManageProject && (
                  <form className="workspace-actions" onSubmit={handleInvite}>
                    <input
                      className="workspace-input"
                      placeholder="Invite by email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                    />
                    <button className="btn secondary" type="submit" disabled={inviting}>
                      {inviting ? "Inviting..." : "Invite"}
                    </button>
                  </form>
                )}
                <div style={{ marginTop: "0.65rem" }}>
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="workspace-actions"
                      style={{ justifyContent: "space-between", marginBottom: "0.45rem" }}
                    >
                      <span className="workspace-muted">{member.name} ({member.email})</span>
                      {canManageProject && String(member._id) !== String(project?.owner?._id || project?.owner) && (
                        <button className="btn danger" onClick={() => handleRemoveMember(member._id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {invitations.filter((inv) => inv.status === "pending").length > 0 && (
                    <div className="workspace-muted" style={{ marginTop: "0.55rem" }}>
                      Pending invites: {invitations.filter((inv) => inv.status === "pending").map((inv) => inv.email).join(", ")}
                    </div>
                  )}
                </div>
              </article>
              {hasTasks ? (
                <div>
                  {tasks.map((task) => {
                    const assignedUserId = String(task.assignedTo?._id || task.assignedTo || "");
                    const canUserDeleteTask =
                      !canManageProject && assignedUserId === String(currentUserId);

                    return (
                    <article className="workspace-card" key={task._id}>
                      <h4>{task.title}</h4>
                      <p>{task.description || "No description added."}</p>
                      <p className="workspace-muted">Priority: {task.priority || "medium"}</p>
                      <p className="workspace-muted">
                        Labels: {Array.isArray(task.labels) && task.labels.length ? task.labels.join(", ") : "-"}
                      </p>
                      <p className="workspace-muted">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</p>
                      <p className="workspace-muted">
                        Assigned: {task.assignedTo ? `${task.assignedTo.name || "User"} (${task.assignedTo.email || ""})` : "Unassigned"}
                      </p>
                      {Array.isArray(task.attachments) && task.attachments.length > 0 && (
                        <div className="workspace-muted" style={{ marginBottom: "0.5rem" }}>
                          Attachments: {task.attachments.map((att) => att.name).join(", ")}
                        </div>
                      )}

                      <div className="workspace-actions">
                        {canManageProject ? (
                          <>
                            <select
                              className="workspace-select"
                              value={task.status}
                              onChange={(event) => handleStatusUpdate(task._id, event.target.value)}
                            >
                              <option value="todo">Todo</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <select
                              className="workspace-select"
                              value={task.assignedTo?._id || task.assignedTo || ""}
                              onChange={(event) => handleAssignTask(task._id, event.target.value)}
                              disabled={assigningTaskId === task._id}
                            >
                              <option value="">Unassigned</option>
                              {members.map((member) => (
                                <option key={member._id} value={member._id}>
                                  {member.name} ({member.email})
                                </option>
                              ))}
                            </select>
                            <button className="btn secondary" onClick={() => navigate(`/tasks/${task._id}/edit`)}>Edit</button>
                            <button className="btn danger" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                          </>
                        ) : (
                          <span className="workspace-muted">Status: {task.status}</span>
                        )}
                        <button className="btn secondary" onClick={() => fetchTaskComments(task._id)}>Comments</button>
                        {!canManageProject && (
                            <button
                              className="btn danger"
                              disabled={!canUserDeleteTask || completingTaskId === task._id}
                              onClick={() => handleCompleteTask(task._id)}
                              title={
                                canUserDeleteTask
                                  ? "Delete this assigned task"
                                  : "Admin must assign this task to you first"
                              }
                            >
                              {completingTaskId === task._id ? "Deleting..." : "Delete"}
                            </button>
                        )}
                      </div>

                      {taskComments[task._id] && (
                        <div style={{ marginTop: "0.7rem" }}>
                          <div className="workspace-actions">
                            <input
                              className="workspace-input"
                              placeholder="Write a comment"
                              value={commentInputs[task._id] || ""}
                              onChange={(event) =>
                                setCommentInputs((prev) => ({ ...prev, [task._id]: event.target.value }))
                              }
                            />
                            <button className="btn secondary" onClick={() => handleAddComment(task._id)}>Post</button>
                          </div>

                          <div style={{ marginTop: "0.6rem" }}>
                            {taskComments[task._id].map((comment) => (
                              <div key={comment._id} className="workspace-card" style={{ marginBottom: "0.45rem" }}>
                                <p style={{ margin: 0 }}>{comment.text}</p>
                                <small className="workspace-muted">
                                  {comment.author?.name || "User"} • {formatDate(comment.createdAt)}
                                </small>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                    );
                  })}

                  <div className="workspace-pagination">
                    <button className="btn secondary" disabled={page <= 1} onClick={() => fetchTasks(page - 1, status, search)}>
                      Previous
                    </button>
                    <span className="workspace-muted">Page {page} of {totalPages}</span>
                    <button className="btn secondary" disabled={page >= totalPages} onClick={() => fetchTasks(page + 1, status, search)}>
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="workspace-empty">
                  No tasks found for this project.
                </div>
              )}

              <div className="workspace-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "1rem" }}>
                <article className="workspace-card">
                  <h3>Team Chat</h3>
                  <form className="workspace-actions" onSubmit={handleSendChat}>
                    <input
                      className="workspace-input"
                      placeholder="Type a team message"
                      value={chatText}
                      onChange={(event) => setChatText(event.target.value)}
                    />
                    <button className="btn secondary" type="submit">Send</button>
                  </form>

                  <div style={{ marginTop: "0.7rem", maxHeight: "260px", overflowY: "auto" }}>
                    {messages.map((message) => (
                      <div key={message._id} className="workspace-card" style={{ marginBottom: "0.45rem" }}>
                        <p style={{ margin: 0 }}>{message.text}</p>
                        <small className="workspace-muted">
                          {message.sender?.name || "User"} • {formatDate(message.createdAt)}
                        </small>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="workspace-card">
                  <h3>Activity Log</h3>
                  <div style={{ maxHeight: "320px", overflowY: "auto", marginTop: "0.55rem" }}>
                    {activity.map((item) => (
                      <div key={item._id} className="workspace-card" style={{ marginBottom: "0.45rem" }}>
                        <p style={{ margin: 0 }}>
                          <strong>{item.actor?.name || "User"}</strong> {item.action}
                        </p>
                        <small className="workspace-muted">{formatDate(item.createdAt)}</small>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProjectDetails;














