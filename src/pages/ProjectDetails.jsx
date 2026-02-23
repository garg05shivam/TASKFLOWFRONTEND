import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "./Workspace.css";

const PAGE_SIZE = 5;

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchProject();
        await fetchTasks(1, "all", "");
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load project details.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFilter = async (nextStatus) => {
    setStatus(nextStatus);
    try {
      await fetchTasks(1, nextStatus, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not filter tasks.");
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      await fetchTasks(1, status, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not search tasks.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted.");
      await fetchTasks(page, status, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete task.");
    }
  };

  const handleStatusUpdate = async (taskId, nextStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      await fetchTasks(page, status, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task status.");
    }
  };

  return (
    <div className="workspace-shell">
      <main className="workspace-container">
        <header className="workspace-header">
          <div>
            <h1>Project Details</h1>
            <p className="workspace-sub">
              {project ? project.name : "Loading project..."}
            </p>
          </div>
          <div className="workspace-nav">
            <Link className="btn secondary" to="/dashboard">Dashboard</Link>
            <Link className="btn" to={`/projects/${id}/tasks/new`}>Create Task</Link>
          </div>
        </header>

        <section className="workspace-panel">
          {loading ? (
            <div className="workspace-empty">Loading project...</div>
          ) : (
            <>
              <div className="workspace-card">
                <h3>{project?.name || "Project"}</h3>
                <p>{project?.description || "No description added."}</p>
              </div>

              <div className="workspace-toolbar">
                <form className="workspace-actions" onSubmit={handleSearch}>
                  <input
                    className="workspace-input"
                    placeholder="Search task title"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <button className="btn secondary" type="submit">Search</button>
                </form>

                <select
                  className="workspace-select"
                  value={status}
                  onChange={(event) => handleFilter(event.target.value)}
                >
                  <option value="all">All status</option>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {!tasks.length ? (
                <div className="workspace-empty">No tasks found for this project.</div>
              ) : (
                <div>
                  {tasks.map((task) => (
                    <article className="workspace-card" key={task._id}>
                      <h4>{task.title}</h4>
                      <p>{task.description || "No description added."}</p>
                      <div className="workspace-actions">
                        <select
                          className="workspace-select"
                          value={task.status}
                          onChange={(event) => handleStatusUpdate(task._id, event.target.value)}
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button className="btn secondary" onClick={() => navigate(`/tasks/${task._id}/edit`)}>
                          Edit
                        </button>
                        <button className="btn danger" onClick={() => handleDeleteTask(task._id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}

                  <div className="workspace-pagination">
                    <button
                      className="btn secondary"
                      disabled={page <= 1}
                      onClick={() => fetchTasks(page - 1, status, search)}
                    >
                      Previous
                    </button>
                    <span className="workspace-muted">Page {page} of {totalPages}</span>
                    <button
                      className="btn secondary"
                      disabled={page >= totalPages}
                      onClick={() => fetchTasks(page + 1, status, search)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProjectDetails;
