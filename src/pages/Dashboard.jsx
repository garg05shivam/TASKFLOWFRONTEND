import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // ✅ FETCH PROJECTS
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Fetch Projects Error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  // ✅ FETCH TASKS
  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks?project=${projectId}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Fetch Tasks Error:", err.response?.data || err.message);
      alert("Error fetching tasks");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchProjects();
  }, []);

  // ✅ CREATE PROJECT
  const handleCreateProject = async () => {
    if (!projectName) return alert("Project name required");

    try {
      await api.post("/projects", {
        name: projectName,
        description: projectDescription,
      });

      setProjectName("");
      setProjectDescription("");
      fetchProjects();
    } catch (err) {
      console.error("Create Project Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating project");
    }
  };

  // ✅ SELECT PROJECT
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetchTasks(project._id);
  };

  // ✅ CREATE TASK
  const handleCreateTask = async () => {
    if (!taskTitle) return alert("Task title required");

    try {
      await api.post("/tasks", {
        title: taskTitle,
        description: taskDescription,
        project: selectedProject._id,
      });

      setTaskTitle("");
      setTaskDescription("");
      fetchTasks(selectedProject._id);
    } catch (err) {
      console.error("Create Task Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating task");
    }
  };

  // ✅ UPDATE TASK STATUS
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      fetchTasks(selectedProject._id);
    } catch (err) {
      console.error("Update Status Error:", err.response?.data || err.message);
      alert("Error updating task status");
    }
  };

  // ✅ DELETE TASK
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks(selectedProject._id);
    } catch (err) {
      console.error("Delete Task Error:", err.response?.data || err.message);
      alert("Error deleting task");
    }
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h3>Create Project</h3>
      <input
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />
      <br /><br />
      <button onClick={handleCreateProject}>Create Project</button>

      <hr />

      <h3>Projects</h3>
      {projects.length === 0 && <p>No projects found.</p>}

      {projects.map((project) => (
        <div key={project._id}>
          <strong
            style={{ cursor: "pointer" }}
            onClick={() => handleSelectProject(project)}
          >
            {project.name}
          </strong>
          <p>{project.description}</p>
          <hr />
        </div>
      ))}

      {selectedProject && (
        <>
          <h3>Tasks for: {selectedProject.name}</h3>

          <input
            placeholder="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Task Description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <br /><br />

          <button onClick={handleCreateTask}>Create Task</button>

          <hr />

          {tasks.length === 0 && <p>No tasks found.</p>}

          {tasks.map((task) => (
            <div key={task._id}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>

              <select
                value={task.status}
                onChange={(e) =>
                  handleUpdateStatus(task._id, e.target.value)
                }
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <br /><br />

              <button onClick={() => handleDeleteTask(task._id)}>
                Delete
              </button>

              <hr />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Dashboard;
