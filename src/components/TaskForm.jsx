function TaskForm({
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  handleCreateTask,
  savingTask,
  disabled,
}) {
  const onSubmit = (event) => {
    event.preventDefault();
    handleCreateTask();
  };

  return (
    <section className="section section-form">
      <h3>Create Task</h3>
      <form className="stack-form" onSubmit={onSubmit}>
        <input
          className="input-field"
          placeholder="Task title"
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          disabled={disabled}
        />

        <textarea
          className="input-field textarea-field"
          placeholder="Task description"
          value={taskDescription}
          onChange={(event) => setTaskDescription(event.target.value)}
          disabled={disabled}
        />

        <button className="button" type="submit" disabled={disabled || savingTask}>
          {savingTask ? "Creating..." : "Create Task"}
        </button>
      </form>
    </section>
  );
}

export default TaskForm;
