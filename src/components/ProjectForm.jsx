function ProjectForm({ projectName, setProjectName, projectDescription, setProjectDescription, handleCreateProject }) {
  return (
    <div className="section">
      <h3>Create Project</h3>

      <input
        className="input-field"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <input
        className="input-field"
        placeholder="Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />

      <button className="button" onClick={handleCreateProject}>
        Create Project
      </button>
    </div>
  );
}

export default ProjectForm;
