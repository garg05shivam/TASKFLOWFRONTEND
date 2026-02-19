import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectForm from "../components/ProjectForm";
import ProjectList from "../components/ProjectList";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const TASKS_PER_PAGE = 5;

function Dashboard() {
  const navigate = useNavigate();
  const { logout, role } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const selectedProjectId = selectedProject?._id;

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTasks = async (projectId, page = 1, status = statusFilter) => {
    if (!projectId) {
      return;
    }

    try {
      setLoadingTasks(true);
      let url = `/tasks?project=${projectId}&page=${page}&limit=${TASKS_PER_PAGE}`;
      if (status !== "all") {
        url += `&status=${status}`;
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

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks(selectedProjectId, 1, "all");
      setStatusFilter("all");
    }
  }, [selectedProjectId]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Project name is required.");
      return;
    }

    try {
      setSavingProject(true);
      const response = await api.post("/projects", {
        name: projectName.trim(),
        description: projectDescription.trim(),
      });
      setProjectName("");
      setProjectDescription("");
      toast.success(response.data.message || "Project created.");
      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create project.");
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
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
    fetchTasks(project._id, 1, "all");
  };

  const handleCreateTask = async () => {
    if (!selectedProjectId) {
      toast.error("Select a project first.");
      return;
    }
    if (!taskTitle.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      setSavingTask(true);
      const response = await api.post("/tasks", {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        project: selectedProjectId,
      });
      setTaskTitle("");
      setTaskDescription("");
      toast.success(response.data.message || "Task created.");
      await fetchTasks(selectedProjectId, 1, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create task.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!selectedProjectId) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted.");
      await fetchTasks(selectedProjectId, currentPage, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete task.");
    }
  };

  const handleUpdateTask = async (taskId, title, description) => {
    if (!selectedProjectId) {
      return;
    }
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      await api.put(`/tasks/${taskId}`, {
        title: title.trim(),
        description: description.trim(),
      });
      toast.success("Task updated.");
      await fetchTasks(selectedProjectId, currentPage, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task.");
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    if (!selectedProjectId) {
      return;
    }

    try {
      await api.put(`/tasks/${taskId}`, { status });
      await fetchTasks(selectedProjectId, currentPage, statusFilter);
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
    fetchTasks(selectedProjectId, 1, status);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const emptyProjects = useMemo(
    () => !loadingProjects && projects.length === 0,
    [loadingProjects, projects.length]
  );

  return (
    <div className="dashboard-shell">
      <div className="dashboard-bg-shape shape-one" />
      <div className="dashboard-bg-shape shape-two" />

      <main className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">TaskFlow Workspace</p>
            <h1>Project Dashboard</h1>
            <p className="dashboard-subtext">
              Track projects, update tasks, and keep delivery moving.
            </p>
          </div>
          <div className="dashboard-header-actions">
            <span className="role-chip">{role || "user"}</span>
            <button className="button button-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-grid">
          <article className="panel">
            <ProjectForm
              projectName={projectName}
              setProjectName={setProjectName}
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
              handleCreateProject={handleCreateProject}
              savingProject={savingProject}
            />

            <ProjectList
              projects={projects}
              selectedProjectId={selectedProjectId}
              loading={loadingProjects}
              handleSelectProject={handleSelectProject}
              handleDeleteProject={handleDeleteProject}
              handleUpdateProject={handleUpdateProject}
            />

            {emptyProjects && (
              <p className="empty-state">No projects yet. Create one to start.</p>
            )}
          </article>

          <article className="panel">
            <div className="tasks-head">
              <div>
                <h3>Tasks</h3>
                <p>
                  {selectedProject ? `Project: ${selectedProject.name}` : "Select a project"}
                </p>
              </div>

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
            </div>

            <TaskForm
              taskTitle={taskTitle}
              setTaskTitle={setTaskTitle}
              taskDescription={taskDescription}
              setTaskDescription={setTaskDescription}
              handleCreateTask={handleCreateTask}
              savingTask={savingTask}
              disabled={!selectedProject}
            />

            <TaskList
              tasks={tasks}
              loading={loadingTasks}
              selectedProject={selectedProject}
              handleDeleteTask={handleDeleteTask}
              handleUpdateStatus={handleUpdateStatus}
              handleUpdateTask={handleUpdateTask}
            />

            {selectedProject && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="button button-secondary"
                  disabled={currentPage === 1}
                  onClick={() => fetchTasks(selectedProjectId, currentPage - 1, statusFilter)}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="button button-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchTasks(selectedProjectId, currentPage + 1, statusFilter)}
                >
                  Next
                </button>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
