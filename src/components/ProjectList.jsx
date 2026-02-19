import { useState } from "react";

function ProjectList({
  projects,
  selectedProjectId,
  loading,
  handleSelectProject,
  handleDeleteProject,
  handleUpdateProject,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const beginEdit = (project) => {
    setEditingId(project._id);
    setEditName(project.name);
    setEditDescription(project.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  if (loading) {
    return <p className="loading-state">Loading projects...</p>;
  }

  return (
    <section className="section">
      <h3>Projects</h3>

      {projects.map((project) => (
        <article
          key={project._id}
          className={`project-card ${selectedProjectId === project._id ? "active" : ""}`}
        >
          {editingId === project._id ? (
            <div className="stack-form">
              <input
                className="input-field"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />

              <textarea
                className="input-field textarea-field"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />

              <div className="inline-actions">
                <button
                  className="button"
                  onClick={() => {
                    handleUpdateProject(project._id, editName, editDescription);
                    cancelEdit();
                  }}
                >
                  Save
                </button>

                <button className="button button-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="project-name"
                onClick={() => handleSelectProject(project)}
              >
                {project.name}
              </button>

              <p>{project.description || "No description added."}</p>

              <div className="inline-actions">
                <button className="button button-secondary" onClick={() => beginEdit(project)}>
                  Edit
                </button>
                <button className="button button-danger" onClick={() => handleDeleteProject(project._id)}>
                  Delete
                </button>
              </div>
            </>
          )}
        </article>
      ))}
    </section>
  );
}

export default ProjectList;
