import { useState } from "react";

function ProjectList({
  projects,
  handleSelectProject,
  handleDeleteProject,
  handleUpdateProject,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  return (
    <div className="section">
      <h3>Projects</h3>

      {projects.map((project) => (
        <div key={project._id} className="project-card">

          {editingId === project._id ? (
            <>
              <input
                className="input-field"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <input
                className="input-field"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />

              <button
                className="button"
                onClick={() => {
                  handleUpdateProject(project._id, editName, editDescription);
                  setEditingId(null);
                }}
              >
                Save
              </button>

              <button
                className="button"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span
                className="project-name"
                onClick={() => handleSelectProject(project)}
              >
                {project.name}
              </span>

              <button
                className="button"
                onClick={() => {
                  setEditingId(project._id);
                  setEditName(project.name);
                  setEditDescription(project.description);
                }}
              >
                Edit
              </button>

              <button
                className="button"
                onClick={() => handleDeleteProject(project._id)}
              >
                Delete
              </button>

              <p>{project.description}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
