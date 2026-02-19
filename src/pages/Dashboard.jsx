import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      alert("Unauthorized or error");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/projects", { name, description });
      setName("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating project");
    }
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
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br /><br />
      <button onClick={handleCreate}>Create</button>

      <hr />

      <h3>My Projects</h3>
      {projects.map((project) => (
        <div key={project._id}>
          <strong>{project.name}</strong>
          <p>{project.description}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
