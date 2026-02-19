function ProjectList({
  projects,
  handleSelectProject,
  handleDeleteProject,
}) {
  return (
    <div className="section">
      <h3>Projects</h3>

      {projects.map((project) => (
        <div key={project._id} className="project-card">
          <span
            className="project-name"
            onClick={() => handleSelectProject(project)}
          >
            {project.name}
          </span>

          <button
            className="button"
            onClick={() => handleDeleteProject(project._id)}
          >
            Delete
          </button>

          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
