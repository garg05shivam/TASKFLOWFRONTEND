import { useState } from "react";

function ProjectList({
  projects,
  selectedProjectId,
  loading,
  handleSelectProject,
  handleDeleteProject,
  handleUpdateProject,
  canManageProject,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const beginEdit = (project) => {
    if (!canManageProject?.(project)) return;
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
      {projects.map((project) => (
        <article
          key={project._id}
          className={`project-card ${selectedProjectId === project._id ? "active" : ""}`}
          onClick={() => {
            if (editingId !== project._id) {
              handleSelectProject(project);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (editingId !== project._id && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              handleSelectProject(project);
            }
          }}
          style={{ cursor: editingId === project._id ? "default" : "pointer" }}
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
                onClick={(event) => {
                  event.stopPropagation();
                  handleSelectProject(project);
                }}
              >
                {project.name}
              </button>

              <p>{project.description || "No description added."}</p>

              {canManageProject?.(project) && (
                <div className="inline-actions">
                  <button
                    className="button button-secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      beginEdit(project);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button button-danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteProject(project._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </article>
      ))}
    </section>
  );
}

export default ProjectList;
