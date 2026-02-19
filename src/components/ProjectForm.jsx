function ProjectForm({
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  handleCreateProject,
  savingProject,
}) {
  const onSubmit = (event) => {
    event.preventDefault();
    handleCreateProject();
  };

  return (
    <section className="section section-form">
      <h3>Create Project</h3>
      <form className="stack-form" onSubmit={onSubmit}>
        <input
          className="input-field"
          placeholder="Project name"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />

        <textarea
          className="input-field textarea-field"
          placeholder="Project description"
          value={projectDescription}
          onChange={(event) => setProjectDescription(event.target.value)}
        />

        <button className="button" type="submit" disabled={savingProject}>
          {savingProject ? "Creating..." : "Create Project"}
        </button>
      </form>
    </section>
  );
}

export default ProjectForm;
