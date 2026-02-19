import "./Dashboard.css";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ProjectForm from "../components/ProjectForm";
import ProjectList from "../components/ProjectList";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const TASKS_PER_PAGE = 5;

  // 🔹 Filtering
  const [statusFilter, setStatusFilter] = useState("all");

  // ================= FETCH PROJECTS =================
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/");
      }
    }
  };

  // ================= FETCH TASKS (WITH FILTER + PAGINATION) =================
  const fetchTasks = async (projectId, page = 1, status = statusFilter) => {
    try {
      let url = `/tasks?project=${projectId}&page=${page}&limit=${TASKS_PER_PAGE}`;

      if (status !== "all") {
        url += `&status=${status}`;
      }

      const res = await api.get(url);

      setTasks(res.data.tasks || []);
      setCurrentPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ================= PROJECT CRUD =================
  const handleCreateProject = async () => {
    await api.post("/projects", {
      name: projectName,
      description: projectDescription,
    });

    setProjectName("");
    setProjectDescription("");
    fetchProjects();
  };

  const handleDeleteProject = async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    fetchProjects();
  };

  const handleUpdateProject = async (projectId, name, description) => {
    await api.put(`/projects/${projectId}`, { name, description });
    fetchProjects();
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setCurrentPage(1);
    setStatusFilter("all");
    fetchTasks(project._id, 1, "all");
  };

  // ================= TASK CRUD =================
  const handleCreateTask = async () => {
    await api.post("/tasks", {
      title: taskTitle,
      description: taskDescription,
      project: selectedProject._id,
    });

    setTaskTitle("");
    setTaskDescription("");
    fetchTasks(selectedProject._id, currentPage);
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    fetchTasks(selectedProject._id, currentPage);
  };

  const handleUpdateTask = async (taskId, title, description) => {
    await api.put(`/tasks/${taskId}`, { title, description });
    fetchTasks(selectedProject._id, currentPage);
  };

  const handleUpdateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchTasks(selectedProject._id, currentPage);
  };

  // ================= FILTER HANDLER =================
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchTasks(selectedProject._id, 1, status);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <button className="button" onClick={handleLogout}>
        Logout
      </button>

      <ProjectForm
        projectName={projectName}
        setProjectName={setProjectName}
        projectDescription={projectDescription}
        setProjectDescription={setProjectDescription}
        handleCreateProject={handleCreateProject}
      />

      <ProjectList
        projects={projects}
        handleSelectProject={handleSelectProject}
        handleDeleteProject={handleDeleteProject}
        handleUpdateProject={handleUpdateProject}
      />

      {selectedProject && (
        <>
          <h3>Tasks for: {selectedProject.name}</h3>

          {/* 🔹 FILTER DROPDOWN */}
          <div style={{ marginBottom: "15px" }}>
            <label>Filter by Status: </label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="select-status"
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <TaskForm
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
            taskDescription={taskDescription}
            setTaskDescription={setTaskDescription}
            handleCreateTask={handleCreateTask}
          />

          <TaskList
            tasks={tasks}
            handleDeleteTask={handleDeleteTask}
            handleUpdateStatus={handleUpdateStatus}
            handleUpdateTask={handleUpdateTask}
          />

          {/* 🔹 PAGINATION */}
          <div className="pagination">
            <button
              className="button"
              disabled={currentPage === 1}
              onClick={() =>
                fetchTasks(selectedProject._id, currentPage - 1)
              }
            >
              Previous
            </button>

            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                fetchTasks(selectedProject._id, currentPage + 1)
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
