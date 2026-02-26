import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectList from "../components/ProjectList";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const TASKS_PER_PAGE = 5;

function Dashboard() {
  const navigate = useNavigate();
  const { logout, role, user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [analytics, setAnalytics] = useState({
    completedThisWeek: 0,
    overdueCount: 0,
    assigneeWorkload: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [superOverview, setSuperOverview] = useState(null);
  const [loadingSuperOverview, setLoadingSuperOverview] = useState(false);
  const [removingUserId, setRemovingUserId] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  const selectedProjectId = selectedProject?._id;
  const currentUserId = user?.id || user?._id || null;

  const canManageProject = (project) => {
    if (!project) return false;
    const ownerId = project?.owner?._id || project?.owner;
    return Boolean(role === "admin" && ownerId && currentUserId && String(ownerId) === String(currentUserId));
  };

  const canManageSelectedProject = canManageProject(selectedProject);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await api.get("/projects");
      const list = response.data.projects || [];
      setProjects(list);

      if (!list.length) {
        setSelectedProject(null);
        setTasks([]);
        setCurrentPage(1);
        setTotalPages(1);
        return;
      }

      if (selectedProjectId) {
        const updatedSelection = list.find((project) => project._id === selectedProjectId);
        if (updatedSelection) {
          setSelectedProject(updatedSelection);
          return;
        }
      }

      setSelectedProject(list[0]);
      setCurrentPage(1);
      setStatusFilter("all");
      setPriorityFilter("all");
      setLabelFilter("all");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTasks = async (
    projectId,
    page = 1,
    status = statusFilter,
    priority = priorityFilter,
    label = labelFilter
  ) => {
    if (!projectId) {
      return;
    }

    try {
      setLoadingTasks(true);
      let url = `/tasks?project=${projectId}&page=${page}&limit=${TASKS_PER_PAGE}`;
      if (status !== "all") {
        url += `&status=${status}`;
      }
      if (priority !== "all") {
        url += `&priority=${priority}`;
      }
      if (label !== "all") {
        url += `&label=${encodeURIComponent(label)}`;
      }

      const response = await api.get(url);
      setTasks(response.data.tasks || []);
      setCurrentPage(response.data.page || 1);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await api.get("/tasks/analytics");
      setAnalytics(response.data.analytics || {
        completedThisWeek: 0,
        overdueCount: 0,
        assigneeWorkload: [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchSuperOverview = async () => {
    try {
      setLoadingSuperOverview(true);
      const response = await api.get("/admin/overview");
      setSuperOverview(response.data.overview || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load super admin overview.");
    } finally {
      setLoadingSuperOverview(false);
    }
  };

  const handleRemoveUser = async (targetUser) => {
    const targetId = targetUser?._id;
    if (!targetId) return;

    const confirmed = window.confirm(
      `Remove ${targetUser.name || "this user"} (${targetUser.email || "-"})?`
    );
    if (!confirmed) return;

    try {
      setRemovingUserId(targetId);
      await api.delete(`/admin/users/${targetId}`);
      toast.success("User removed.");
      await fetchSuperOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove user.");
    } finally {
      setRemovingUserId("");
    }
  };

  const handleChangeUserRole = async (targetUser, nextRole) => {
    const targetId = targetUser?._id;
    if (!targetId) return;

    const confirmed = window.confirm(
      `Change role of ${targetUser.name || "this user"} to ${nextRole}?`
    );
    if (!confirmed) return;

    try {
      setUpdatingUserId(targetId);
      await api.patch(`/admin/users/${targetId}/role`, { role: nextRole });
      toast.success("Role updated.");
      await fetchSuperOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update role.");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleChangeUserStatus = async (targetUser, nextActive) => {
    const targetId = targetUser?._id;
    if (!targetId) return;

    const verb = nextActive ? "activate" : "deactivate";
    const confirmed = window.confirm(
      `Do you want to ${verb} ${targetUser.name || "this user"}?`
    );
    if (!confirmed) return;

    try {
      setUpdatingUserId(targetId);
      await api.patch(`/admin/users/${targetId}/status`, { isActive: nextActive });
      toast.success("Status updated.");
      await fetchSuperOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingUserId("");
    }
  };

  useEffect(() => {
    if (role === "super_admin") {
      fetchSuperOverview();
      return;
    }

    fetchProjects();
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (role === "super_admin") {
      return;
    }

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
  }, [role]);

  useEffect(() => {
    if (role === "super_admin") {
      return;
    }

    if (selectedProjectId) {
      fetchTasks(selectedProjectId, 1, "all", "all", "all");
      setStatusFilter("all");
      setPriorityFilter("all");
      setLabelFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const handleDeleteProject = async (projectId) => {
    const project = projects.find((item) => item._id === projectId);
    if (!canManageProject(project)) {
      toast.error("Only project admin can delete project.");
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted.");

      if (selectedProjectId === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }

      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete project.");
    }
  };

  const handleUpdateProject = async (projectId, name, description) => {
    const project = projects.find((item) => item._id === projectId);
    if (!canManageProject(project)) {
      toast.error("Only project admin can update project.");
      return;
    }

    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    try {
      await api.put(`/projects/${projectId}`, {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Project updated.");
      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update project.");
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setCurrentPage(1);
    setStatusFilter("all");
    setPriorityFilter("all");
    setLabelFilter("all");
    fetchTasks(project._id, 1, "all", "all", "all");
  };

  const handleUpdateStatus = async (taskId, status) => {
    if (!selectedProjectId) {
      return;
    }

    if (!canManageSelectedProject) {
      toast.error("Only project admin can update task status.");
      return;
    }

    try {
      await api.put(`/tasks/${taskId}`, { status });
      await fetchTasks(selectedProjectId, currentPage, statusFilter, priorityFilter, labelFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update status.");
    }
  };

  const handleFilterChange = (status) => {
    if (!selectedProjectId) {
      return;
    }
    setStatusFilter(status);
    setCurrentPage(1);
    fetchTasks(selectedProjectId, 1, status, priorityFilter, labelFilter);
  };

  const handlePriorityFilterChange = (priority) => {
    if (!selectedProjectId) {
      return;
    }
    setPriorityFilter(priority);
    setCurrentPage(1);
    fetchTasks(selectedProjectId, 1, statusFilter, priority, labelFilter);
  };

  const handleLabelFilterChange = (label) => {
    if (!selectedProjectId) {
      return;
    }
    setLabelFilter(label);
    setCurrentPage(1);
    fetchTasks(selectedProjectId, 1, statusFilter, priorityFilter, label);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const emptyProjects = useMemo(
    () => !loadingProjects && projects.length === 0,
    [loadingProjects, projects.length]
  );

  const workloadRows = analytics.assigneeWorkload || [];
  const availableLabels = useMemo(() => {
    const unique = new Set();
    tasks.forEach((task) => {
      (task.labels || []).forEach((label) => {
        const normalized = String(label || "").trim().toLowerCase();
        if (normalized) unique.add(normalized);
      });
    });
    return Array.from(unique).sort();
  }, [tasks]);

  const kanbanColumns = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      "in-progress": tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
    };
  }, [tasks]);

  const taskDensity = tasks.length;
  const doneCount = kanbanColumns.done.length;
  const highPriorityCount = tasks.filter((task) => task.priority === "high").length;

  const priorityClassName = (priority) => {
    const value = String(priority || "medium").toLowerCase();
    if (value === "high") return "priority-chip high";
    if (value === "low") return "priority-chip low";
    return "priority-chip medium";
  };

  const statusChartData = [
    { label: "Todo", value: role === "super_admin" ? (superOverview?.tasksByStatus?.todo || 0) : (analytics?.tasksByStatus?.todo || 0) },
    {
      label: "In Progress",
      value: role === "super_admin"
        ? (superOverview?.tasksByStatus?.["in-progress"] || 0)
        : (analytics?.tasksByStatus?.["in-progress"] || 0),
    },
    { label: "Done", value: role === "super_admin" ? (superOverview?.tasksByStatus?.done || 0) : (analytics?.tasksByStatus?.done || 0) },
  ];

  const priorityChartData = [
    { label: "Low", value: role === "super_admin" ? (superOverview?.tasksByPriority?.low || 0) : (analytics?.tasksByPriority?.low || 0) },
    {
      label: "Medium",
      value: role === "super_admin" ? (superOverview?.tasksByPriority?.medium || 0) : (analytics?.tasksByPriority?.medium || 0),
    },
    { label: "High", value: role === "super_admin" ? (superOverview?.tasksByPriority?.high || 0) : (analytics?.tasksByPriority?.high || 0) },
  ];

  const trendChartData = role === "super_admin"
    ? (superOverview?.completedTrend7d || [])
    : (analytics?.completedTrend7d || []);

  const renderBarSeries = (rows) => {
    const max = Math.max(1, ...rows.map((r) => r.value || 0));
    return rows.map((row) => (
      <div key={row.label} className="chart-row">
        <span className="chart-label">{row.label}</span>
        <div className="chart-track">
          <div className="chart-fill" style={{ width: `${Math.round(((row.value || 0) / max) * 100)}%` }} />
        </div>
        <strong className="chart-value">{row.value || 0}</strong>
      </div>
    ));
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-bg-shape shape-one" />
      <div className="dashboard-bg-shape shape-two" />

      <main className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">TaskFlow Workspace</p>
            <h1>Project Dashboard</h1>
            <p className="dashboard-subtext">Manage projects and tasks from one place.</p>
            <div className="dashboard-hero-metrics">
              {role === "super_admin" ? (
                <>
                  <span>{superOverview?.totalUsers || 0} Users</span>
                  <span>{superOverview?.totalProjects || 0} Projects</span>
                  <span>{superOverview?.overdueTasks || 0} Overdue</span>
                  <span>{superOverview?.tasksByStatus?.done || 0} Done</span>
                </>
              ) : (
                <>
                  <span>{projects.length} Projects</span>
                  <span>{taskDensity} Visible Tasks</span>
                  <span>{highPriorityCount} High Priority</span>
                  <span>{doneCount} Done</span>
                </>
              )}
            </div>
          </div>
          <div className="dashboard-header-actions">
            <span className="role-chip">{role || "user"}</span>
            {role === "admin" && (
              <button className="button button-secondary" onClick={() => navigate("/projects/new")}>
                Create Project
              </button>
            )}
            <button className="button button-secondary" onClick={() => navigate("/profile")}>
              Profile
            </button>
            {role !== "super_admin" && (
              <button className="button button-secondary" onClick={() => navigate("/notifications")}>
                Notifications {unreadNotifications > 0 ? `(${unreadNotifications})` : ""}
              </button>
            )}
            <button className="button button-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {role === "super_admin" ? (
          <section className="dashboard-grid">
            <article className="panel" style={{ gridColumn: "1 / -1" }}>
              <div className="tasks-head" style={{ marginBottom: "0.8rem" }}>
                <h3>System Overview</h3>
              </div>
              {loadingSuperOverview ? (
                <p className="loading-state">Loading super admin dashboard...</p>
              ) : !superOverview ? (
                <p className="empty-state">No overview data available.</p>
              ) : (
                <>
                  <div className="analytics-grid">
                    <article className="analytics-card">
                      <p className="analytics-label">Total Users</p>
                      <h4>{superOverview.totalUsers || 0}</h4>
                    </article>
                    <article className="analytics-card">
                      <p className="analytics-label">Total Admins</p>
                      <h4>{superOverview.totalAdmins || 0}</h4>
                    </article>
                    <article className="analytics-card">
                      <p className="analytics-label">Total Projects</p>
                      <h4>{superOverview.totalProjects || 0}</h4>
                    </article>
                    <article className="analytics-card">
                      <p className="analytics-label">Total Tasks</p>
                      <h4>{superOverview.totalTasks || 0}</h4>
                    </article>
                    <article className="analytics-card">
                      <p className="analytics-label">Overdue Tasks</p>
                      <h4>{superOverview.overdueTasks || 0}</h4>
                    </article>
                    <article className="analytics-card">
                      <p className="analytics-label">Completed This Week</p>
                      <h4>{superOverview.completedThisWeek || 0}</h4>
                    </article>
                  </div>

                  <div className="super-grid" style={{ marginTop: "0.9rem" }}>
                    <article className="panel" style={{ boxShadow: "none" }}>
                      <h4 style={{ marginTop: 0, color: "#13233f" }}>Tasks by Status</h4>
                      <div className="analytics-row">
                        <span>Todo</span>
                        <strong>{superOverview.tasksByStatus?.todo || 0}</strong>
                      </div>
                      <div className="analytics-row">
                        <span>In Progress</span>
                        <strong>{superOverview.tasksByStatus?.["in-progress"] || 0}</strong>
                      </div>
                      <div className="analytics-row" style={{ marginBottom: 0 }}>
                        <span>Done</span>
                        <strong>{superOverview.tasksByStatus?.done || 0}</strong>
                      </div>
                    </article>
                    <article className="panel" style={{ boxShadow: "none" }}>
                      <h4 style={{ marginTop: 0, color: "#13233f" }}>Recent Users</h4>
                      {!superOverview.recentUsers?.length ? (
                        <p className="empty-state">No users found.</p>
                      ) : (
                        superOverview.recentUsers.map((item) => (
                          <div key={item._id} className="analytics-row">
                            <span>
                              {item.name} ({item.role})
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <strong>
                                {item.isVerified ? "Verified" : "Pending"} •{" "}
                                {item.isActive === false ? "Inactive" : "Active"}
                              </strong>
                              {item.role === "user" && (
                                <button
                                  className="button button-secondary"
                                  style={{ padding: "0.35rem 0.6rem" }}
                                  disabled={updatingUserId === item._id}
                                  onClick={() => handleChangeUserRole(item, "admin")}
                                >
                                  Promote
                                </button>
                              )}
                              {item.role === "admin" && (
                                <button
                                  className="button button-secondary"
                                  style={{ padding: "0.35rem 0.6rem" }}
                                  disabled={updatingUserId === item._id}
                                  onClick={() => handleChangeUserRole(item, "user")}
                                >
                                  Demote
                                </button>
                              )}
                              {item.isActive === false ? (
                                <button
                                  className="button button-secondary"
                                  style={{ padding: "0.35rem 0.6rem" }}
                                  disabled={updatingUserId === item._id}
                                  onClick={() => handleChangeUserStatus(item, true)}
                                >
                                  Activate
                                </button>
                              ) : (
                                <button
                                  className="button button-secondary"
                                  style={{ padding: "0.35rem 0.6rem" }}
                                  disabled={updatingUserId === item._id}
                                  onClick={() => handleChangeUserStatus(item, false)}
                                >
                                  Deactivate
                                </button>
                              )}
                              {item.role !== "super_admin" && String(item._id) !== String(currentUserId) && (
                                <button
                                  className="button button-danger"
                                  style={{ padding: "0.35rem 0.6rem" }}
                                  disabled={removingUserId === item._id || updatingUserId === item._id}
                                  onClick={() => handleRemoveUser(item)}
                                >
                                  {removingUserId === item._id ? "Removing..." : "Remove"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </article>
                  </div>

                  <div className="super-grid" style={{ marginTop: "0.9rem" }}>
                    <article className="panel" style={{ boxShadow: "none" }}>
                      <h4 style={{ marginTop: 0, color: "#13233f" }}>Tasks by Status Chart</h4>
                      <div className="chart-stack">{renderBarSeries(statusChartData)}</div>
                    </article>
                    <article className="panel" style={{ boxShadow: "none" }}>
                      <h4 style={{ marginTop: 0, color: "#13233f" }}>Tasks by Priority Chart</h4>
                      <div className="chart-stack">{renderBarSeries(priorityChartData)}</div>
                    </article>
                  </div>

                  <article className="panel" style={{ boxShadow: "none", marginTop: "0.9rem" }}>
                    <h4 style={{ marginTop: 0, color: "#13233f" }}>Completed Tasks (Last 7 Days)</h4>
                    <div className="chart-stack">{renderBarSeries(trendChartData)}</div>
                  </article>
                </>
              )}
            </article>
          </section>
        ) : (
        <section className="dashboard-grid">
          <article className="panel" style={{ gridColumn: "1 / -1" }}>
            <div className="tasks-head" style={{ marginBottom: "0.8rem" }}>
              <h3>Analytics</h3>
            </div>
            {loadingAnalytics ? (
              <p className="loading-state">Loading analytics...</p>
            ) : (
              <>
                <div className="analytics-grid">
                  <article className="analytics-card">
                    <p className="analytics-label">Completed This Week</p>
                    <h4>{analytics.completedThisWeek || 0}</h4>
                  </article>
                  <article className="analytics-card">
                    <p className="analytics-label">Overdue Tasks</p>
                    <h4>{analytics.overdueCount || 0}</h4>
                  </article>
                  <article className="analytics-card">
                    <p className="analytics-label">Assignees With Open Tasks</p>
                    <h4>{workloadRows.length}</h4>
                  </article>
                </div>

                <div className="analytics-table">
                  <h4>Assignee Workload</h4>
                  {!workloadRows.length ? (
                    <p className="empty-state">No open assigned tasks.</p>
                  ) : (
                    workloadRows.map((item) => (
                      <div key={item.assigneeId} className="analytics-row">
                        <span>{item.name} ({item.email})</span>
                        <strong>{item.openTasks}</strong>
                      </div>
                    ))
                  )}
                </div>

                <div className="super-grid" style={{ marginTop: "0.9rem" }}>
                  <article className="panel" style={{ boxShadow: "none" }}>
                    <h4 style={{ marginTop: 0, color: "#13233f" }}>Tasks by Status Chart</h4>
                    <div className="chart-stack">{renderBarSeries(statusChartData)}</div>
                  </article>
                  <article className="panel" style={{ boxShadow: "none" }}>
                    <h4 style={{ marginTop: 0, color: "#13233f" }}>Tasks by Priority Chart</h4>
                    <div className="chart-stack">{renderBarSeries(priorityChartData)}</div>
                  </article>
                </div>

                <article className="panel" style={{ boxShadow: "none", marginTop: "0.9rem" }}>
                  <h4 style={{ marginTop: 0, color: "#13233f" }}>Completed Tasks (Last 7 Days)</h4>
                  <div className="chart-stack">{renderBarSeries(trendChartData)}</div>
                </article>
              </>
            )}
          </article>

          <article className="panel">
            <div className="tasks-head" style={{ marginBottom: "0.8rem" }}>
              <h3>Projects</h3>
              {role === "admin" && (
                <button className="button button-secondary" onClick={() => navigate("/projects/new")}>
                  New
                </button>
              )}
            </div>

            <ProjectList
              projects={projects}
              selectedProjectId={selectedProjectId}
              loading={loadingProjects}
              handleSelectProject={handleSelectProject}
              handleDeleteProject={handleDeleteProject}
              handleUpdateProject={handleUpdateProject}
              canManageProject={canManageProject}
            />

            {emptyProjects && <p className="empty-state">No projects yet. Create one to start.</p>}
          </article>

          <article className="panel">
            <div className="tasks-head">
              <div>
                <h3>Tasks</h3>
                <p>{selectedProject ? `Project: ${selectedProject.name}` : "Select a project"}</p>
              </div>

              <div className="dashboard-header-actions">
                {selectedProject && (
                  <button className="button button-secondary" onClick={() => navigate(`/projects/${selectedProjectId}`)}>
                    Project Details
                  </button>
                )}
                {selectedProject && canManageSelectedProject && (
                  <button
                    className="button button-secondary"
                    onClick={() => navigate(`/projects/${selectedProjectId}/tasks/new`)}
                  >
                    Create Task
                  </button>
                )}
                {selectedProject && (
                  <div className="filter-wrap">
                    <label htmlFor="status-filter">Status</label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(event) => handleFilterChange(event.target.value)}
                      className="select-status"
                    >
                      <option value="all">All</option>
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                )}
                {selectedProject && (
                  <div className="filter-wrap">
                    <label htmlFor="priority-filter">Priority</label>
                    <select
                      id="priority-filter"
                      value={priorityFilter}
                      onChange={(event) => handlePriorityFilterChange(event.target.value)}
                      className="select-status"
                    >
                      <option value="all">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                )}
                {selectedProject && (
                  <div className="filter-wrap">
                    <label htmlFor="label-filter">Label</label>
                    <select
                      id="label-filter"
                      value={labelFilter}
                      onChange={(event) => handleLabelFilterChange(event.target.value)}
                      className="select-status"
                    >
                      <option value="all">All</option>
                      <option value="bug">bug</option>
                      <option value="design">design</option>
                      <option value="backend">backend</option>
                      {availableLabels
                        .filter((label) => !["bug", "design", "backend"].includes(label))
                        .map((label) => (
                          <option key={label} value={label}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {!selectedProject ? (
              <p className="empty-state">Select a project to open the Kanban board.</p>
            ) : loadingTasks ? (
              <p className="loading-state">Loading tasks...</p>
            ) : !tasks.length ? (
              <p className="empty-state">No tasks found for this project.</p>
            ) : (
              <div className="kanban-board">
                {[
                  { key: "todo", label: "Todo" },
                  { key: "in-progress", label: "In Progress" },
                  { key: "done", label: "Done" },
                ].map((column) => (
                  <section key={column.key} className="kanban-column">
                    <header className="kanban-header">
                      <h4>{column.label}</h4>
                      <span>{kanbanColumns[column.key].length}</span>
                    </header>
                    <div className="kanban-list">
                      {kanbanColumns[column.key].map((task) => (
                        <article key={task._id} className="kanban-card">
                          <h5>{task.title}</h5>
                          <p>{task.description || "No description added."}</p>
                          <p className="muted-text">
                            <span className={priorityClassName(task.priority)}>
                              {String(task.priority || "medium").toUpperCase()}
                            </span>
                          </p>
                          <p className="muted-text">
                            Labels:{" "}
                            {Array.isArray(task.labels) && task.labels.length ? (
                              task.labels.map((label) => (
                                <span key={`${task._id}-${label}`} className="label-chip">
                                  {label}
                                </span>
                              ))
                            ) : (
                              "-"
                            )}
                          </p>
                          <p className="muted-text">
                            Assigned: {task.assignedTo ? `${task.assignedTo.name || "User"}` : "Unassigned"}
                          </p>
                          <p className="muted-text">
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                          </p>
                          {canManageSelectedProject && (
                            <select
                              className="select-status"
                              value={task.status}
                              onChange={(event) => handleUpdateStatus(task._id, event.target.value)}
                            >
                              <option value="todo">Todo</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          )}
                        </article>
                      ))}
                      {!kanbanColumns[column.key].length && (
                        <p className="kanban-empty">No tasks</p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {selectedProject && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="button button-secondary"
                  disabled={currentPage === 1}
                  onClick={() => fetchTasks(selectedProjectId, currentPage - 1, statusFilter, priorityFilter, labelFilter)}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="button button-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchTasks(selectedProjectId, currentPage + 1, statusFilter, priorityFilter, labelFilter)}
                >
                  Next
                </button>
              </div>
            )}
          </article>
        </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;


