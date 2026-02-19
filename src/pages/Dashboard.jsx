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
  const { logout, token } = useAuth(); // ✅ use context

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // ================= FETCH PROJECTS =================
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout(); // ✅ use context logout
        navigate("/");
      }
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks?project=${projectId}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ================= CHECK AUTH =================
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

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetchTasks(project._id);
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
    fetchTasks(selectedProject._id);
  };

  const handleDeleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    fetchTasks(selectedProject._id);
  };

  const handleUpdateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchTasks(selectedProject._id);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    logout(); // ✅ clean logout
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
      />

      {selectedProject && (
        <>
          <h3>Tasks for: {selectedProject.name}</h3>

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
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
