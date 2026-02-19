function TaskForm({
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  handleCreateTask,
}) {
  return (
    <div className="section">
      <input
        className="input-field"
        placeholder="Task Title"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />

      <input
        className="input-field"
        placeholder="Task Description"
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />

      <button className="button" onClick={handleCreateTask}>
        Create Task
      </button>
    </div>
  );
}

export default TaskForm;
