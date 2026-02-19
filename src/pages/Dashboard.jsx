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

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      navigate("/");
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks?project=${projectId}`);
      setTasks(res.data.tasks);
    } catch (err) {
      alert("Error fetching tasks");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      await api.post("/projects", {
        name: projectName,
        description: projectDescription,
      });
      setProjectName("");
      setProjectDescription("");
      fetchProjects();
    } catch (err) {
      alert("Error creating project");
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetchTasks(project._id);
  };

  const handleCreateTask = async () => {
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
      alert("Error creating task");
    }
  };

  const handleDeleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks(selectedProject._id);
  };

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
      {projects.map((project) => (
        <div key={project._id}>
          <strong onClick={() => handleSelectProject(project)}>
            {project.name}
          </strong>
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

          {tasks.map((task) => (
            <div key={task._id}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
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
